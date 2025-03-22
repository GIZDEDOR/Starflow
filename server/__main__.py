from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, Update, WebAppInfo, LabeledPrice, PreCheckoutQuery
from aiogram.filters import CommandStart
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.methods import CreateInvoiceLink

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from config_reader import config

bot = Bot(config.BOT_TOKEN.get_secret_value())
dp = Dispatcher()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Устанавливаем вебхук
    await bot.set_webhook(
        url=config.WEBHOOK_URL + config.WEBHOOK_PATH,
        drop_pending_updates=True
    )
    yield
    # Удаляем вебхук при завершении
    await bot.delete_webhook()
    await bot.session.close()

app = FastAPI(lifespan=lifespan)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

markup = (
    InlineKeyboardBuilder()
    .button(text="Открой меня", web_app=WebAppInfo(url=config.WEBAPP_URL))
).as_markup()

@dp.message(CommandStart())
async def start(message: Message) -> None:
    await message.answer("Hello!", reply_markup=markup)


@dp.pre_checkout_query()
async def precheck(event: PreCheckoutQuery) -> None:
    await event.answer(True)

@dp.message(F.successful_payment)
async def succesful_payment(message: Message) -> None:
    await message.answer("Спасибо за покупку!!!")

@app.post("/api/donate", response_class=JSONResponse)
async def donate(request: Request) -> JSONResponse:
    data = await request.json()
    invoice_link = await bot(
        CreateInvoiceLink(
            title="Donate",
            description="Сделай мою жизнь лучше!",
            payload="donate",
            currency="XTR",
            prices=[LabeledPrice(label="XTR", amount= data["amount"])]
        )
    )

    return JSONResponse({"invoice_link": invoice_link})

@app.post(config.WEBHOOK_PATH)
async def webhook(request: Request) -> JSONResponse:
    try:
        update = Update.model_validate(await request.json(), context={"bot": bot})
        await dp.feed_update(bot=bot, update=update)
        return JSONResponse(content={"status": "ok"})
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )

@app.get("/")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=config.APP_HOST,
        port=config.APP_PORT
    )