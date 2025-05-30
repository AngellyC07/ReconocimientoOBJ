# Asistente de Limitantes Visuales para Reconocimiento de Objetos del Laboratorio Smart Center de la Unab
Nathalia Quintero - Angelly Cristancho

------------------------------------------------
Desarrollo de una aplicación móvil para Android que captura imágenes y las envía a un servidor backend desplegado en Azure mediante una API REST. El servidor procesa las imágenes utilizando el modelo de detección de objetos YOLOv8 previamente entrenado y devuelve las predicciones a la aplicación, que las muestra al usuario en tiempo real

-------------------------------------------------
# **Backend – FastAPI en Azure (Ubuntu Server 24.04 LTS)**

## **1.1 Crear y configurar la máquina virtual en Azure**

Accedemos al portal: https://portal.azure.com

Creamos una nueva máquina virtual con:

![image](https://github.com/user-attachments/assets/048a55b0-6dba-4b9c-b716-786e2d96d44f)

- Grupo de recursos: personalizado  
- Nombre de la VM: libre  
- Región: East US (predeterminada)  
- Zona: 1  
- Imagen: Ubuntu Server 24.04 LTS  
- Tipo de autenticación: Clave pública SSH  
- Puertos abiertos: SSH (22) y más adelante el puerto de la API (8080)  

## **1.2 Conexión Bitvise**

Ingresamos los datos de la máquina virtual y conectamos:

![image](https://github.com/user-attachments/assets/1fb2fe76-25fb-456f-bce4-fde7ae6dbf69)

Una vez dentro del entorno nos dirigimos a home:

```bash
sudo su
Vemos las carpetas:

bash
Copiar
Editar
ls -la
Vemos la versión de Python:

bash
Copiar
Editar
python3 -V
Si se requiere, actualizamos los paquetes:

bash
Copiar
Editar
apt update -y
Instalamos pip y virtualenv si es necesario:

bash
Copiar
Editar
apt install python3-pip python3-venv -y
1.3 Entorno del proyecto
Creamos la carpeta del proyecto:

bash
Copiar
Editar
mkdir proyecto
Accedemos a la carpeta:

bash
Copiar
Editar
cd proyecto


Creamos y activamos el entorno virtual:

bash
Copiar
Editar
python3 -m venv venv
source venv/bin/activate


Instalamos las dependencias necesarias:

bash
Copiar
Editar
pip install fastapi uvicorn ultralytics 
pip install python-multipart
pip install pillow
1.4 Traspaso del modelo .pt
Importamos el modelo best.pt a la carpeta del proyecto.



1.5 Creación de la API FastAPI
Creamos un archivo app.py en la máquina virtual:

bash
Copiar
Editar
nano app.py
Pegamos el siguiente código:

python
Copiar
Editar
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
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
Verificamos que el archivo fue creado:

bash
Copiar
Editar
ls -la
1.6 Ejecutar servidor FastAPI
Ejecutamos el servidor:

bash
Copiar
Editar
uvicorn app:app --host 0.0.0.0 --port 8080 --reload


1.7 Prueba de Backend
Usamos Postman:
Entramos a https://www.postman.com e iniciamos sesión.

Creamos una nueva solicitud:



Llenamos los datos:



Colocamos la IP de la VM seguida de :8080/predict





La API estará disponible en:

arduino
Copiar
Editar
http://<IP>:8080/predict/

------------------------------------------------------

2. Frontend – React Native


