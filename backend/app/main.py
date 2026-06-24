from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"mensaje": "¡Cómo encontraste esto? este es el backend de algo secreto!"}
