# Asistente de Limitantes Visuales para Reconocimiento de Objetos del Laboratorio Smart Center de la Unab
Nathalia Quintero - Angelly Cristancho

------------------------------------------------
Desarrollo de una aplicación móvil para Android que captura imágenes y las envía a un servidor backend desplegado en Azure mediante una API REST. El servidor procesa las imágenes utilizando el modelo de detección de objetos YOLOv8 previamente entrenado y devuelve las predicciones a la aplicación, que las muestra al usuario en tiempo real

-------------------------------------------------
1. Backend – FastAPI en Azure (Ubuntu Server 24.04 LTS)
  
1.1 Crear y configurar la máquina virtual en Azure.
   
   Accedemos al portal: https://portal.azure.com
   Creamos una nueva máquina virtual con:
   Grupo de recursos: personalizado.
   Nombre de la VM: libre. Región: East US (predeterminada).
   Zona: 1. Imagen: Ubuntu Server 24.04 LTS.
   Tipo de autenticación: Clave pública SSH.
   Puertos abiertos: SSH (22) y más adelante el puerto de la API (8080).
   
1.2 Conexión Bitvise

Ingresamos los datos de la máquina virtual y conectamos

![image](https://github.com/user-attachments/assets/1fb2fe76-25fb-456f-bce4-fde7ae6dbf69)


Una vez dentro del entorno nos dirigimos a home

sudo su

1.3 Entorno del proyecto

Creamos la carpeta del proyecto

mkdir proyecto

Accedemos a la carpeta

cd proyecto

![image](https://github.com/user-attachments/assets/d025efe1-87d2-4a7a-97ff-bc57641ee469)


Creamos y activamos el entorno virtual

python3 -m venv venv
source venv/bin/activate

Instalaciones requeridas

pip install fastapi uvicorn ultralytics 
pip install python-multipart
pip install pillow
   
1.4 Traspaso del modelo .pt

Se importa el modelo a utilizar que es el best.pt a la carpeta proyecto previamente creada.


![image](https://github.com/user-attachments/assets/5bb68a68-1c6e-4d82-b824-f7ec22829569)


1.5 Creación de la API FastAPI

Creamos un archivo app.py en la máquina virtual de Azure que contiene el backend con FastAPI para servir las predicciones del modelo YOLOv8.

nano app.py

Código del Backend con FastAPI y YOLOv8
Desarrollo del Backend API Usaremos FastAPI por su rendimiento y facilidad de uso. El backend aceptará una imagen, la procesará con el modelo YOLOv8 best.pt y devolverá la predicción.

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import numpy as np
import io
import uvicorn

app = FastAPI()

# Cargar modelo YOLOv8
model = YOLO("best.pt")

# Diccionario de clases actualizado
class_labels = {
    0: {"nombre": "Microscopio óptico avanzado", "descripcion": "Permite observar muestras pequeñas con luz y lentes."},
    1: {"nombre": "Agitador magnético con placa calefactora", "descripcion": "Mezcla y calienta líquidos en laboratorios."},
    2: {"nombre": "Aire acondicionado YORK", "descripcion": "Regula temperatura y aire en espacios cerrados."},
    3: {"nombre": "Cafetera", "descripcion": "Prepara café automáticamente con agua caliente."},
    4: {"nombre": "Casilleros", "descripcion": "Armarios para guardar objetos personales."},
    5: {"nombre": "Computador", "descripcion": "Procesa información y ejecuta programas."},
    6: {"nombre": "Control remoto de robot", "descripcion": "Permite manejar un robot a distancia."},
    7: {"nombre": "Control remoto de Smart TV", "descripcion": "Mando para controlar funciones del televisor."},
    8: {"nombre": "Estación de soldadura por aire caliente", "descripcion": "Para soldar componentes con aire caliente."},
    9: {"nombre": "Impresora 3D Creality K1 Max", "descripcion": "Crea objetos 3D a partir de diseños digitales."},
    10: {"nombre": "Mini fresadora CNC", "descripcion": "Corta o talla materiales controlada por computadora."},
    11: {"nombre": "Mouse", "descripcion": "Dispositivo para interactuar con la computadora."},
    12: {"nombre": "Osciloscopio digital Rigol DS1202ZE", "descripcion": "Visualiza señales eléctricas como ondas."},
    13: {"nombre": "Puerta", "descripcion": "Permite o restringe el acceso a espacios."},
    14: {"nombre": "Robot humanoide AULER", "descripcion": "Robot con forma y movimientos similares a un humano."},
    15: {"nombre": "Router", "descripcion": "Distribuye internet a múltiples dispositivos."},
    16: {"nombre": "Sensor de suelo integrado", "descripcion": "Mide humedad y temperatura del suelo."},
    17: {"nombre": "Tablet", "descripcion": "Dispositivo táctil portátil con múltiples funciones."},
    18: {"nombre": "Tomacorrientes 110V", "descripcion": "Permite conectar aparatos a la red eléctrica."},
    19: {"nombre": "UPS Netio", "descripcion": "Suministro de energía en caso de cortes eléctricos."}
}

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        results = model.predict(image)

        detections = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].tolist()

                label_info = class_labels.get(cls_id, {
                    "nombre": "Clase desconocida",
                    "descripcion": "Descripción no disponible"
                })

                detections.append({
                    "class_id": cls_id,
                    "nombre": label_info["nombre"],
                    "descripcion": label_info["descripcion"],
                    "confidence": conf,
                    "bbox": xyxy
                })

        return JSONResponse(content={"detections": detections})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# del bloque final 
if _name_ == "_main_":
    uvicorn.run(app, host="0.0.0.0", port=8080)



------------------------------------------------------

2. Frontend – React Native


