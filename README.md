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
```
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

##**2. Frontend – React Native**
La aplicación móvil fue desarrollada utilizando **React Native con Expo** para garantizar compatibilidad multiplataforma y facilitar el desarrollo. La arquitectura sigue un patrón de **navegación por pantallas** con **gestión de estado local** para cada componente.
  **2.2 Configuración del Entorno de Desarrollo**
   **2.2.1 Prerrequisitos del Sistema**
   ```python
   # Verificar versiones requeridas
    node --version    # v18.0.0 o superior
    npm --version     # v8.0.0 o superior
   ```
   **2.2.2 Instalación de Expo CLI**
   ```python
   # Instalación global de Expo CLI
    npm install -g @expo/cli
    
    # Verificar instalación
    expo --version
   ```
   **2.2.3 Creación del Proyecto**
    ```python
    # Crear nuevo proyecto con Expo
    npx create-expo-app proyecto_final_cd --template blank
    
    # Navegar al directorio del proyecto
    cd AsistenteVisual
    
    # Instalar dependencias adicionales
    npm install axios expo-camera expo-image-picker expo-speech expo-router
   ```
   2.2.4 Estructura de Archivos del Proyecto
   ```python
    proyecto_final_cd/
    ├── app/
    │   ├── page.tsx                    # Punto de entrada principal
    │   ├── camera.tsx                  # Ruta de cámara
    │   ├── gallery.tsx                 # Ruta de galería
    │   └── about.tsx                   # Ruta de información
    ├── acreens/
    │   ├── main-menu-screen.js         # Componente del menú principal
    │   ├── camera-screen.js            # Componente de cámara
    │   ├── gallery-screen.js           # Componente de galería
    │   ├── about-screen.js            # Componente de información
    │   └── welcome-screen.js  
    ├── package.json                    # Dependencias del proyecto
    └── app.json                        # Configuración de Expo
   ```
------------------------------------------------------
### **2.3 Implementación de Componentes Principales**
### 2.3.1 Ventana de Bienvenida (WelcomeScreen.js)
En esta pestaña se uilizo un slidar para dal la bienvenida al usuario al ingresar en la app.
El codigo utilizado es el siguiente:
```python
import { router } from 'expo-router';
import * as Speech from 'expo-speech'; // ← NUEVO: Importar Speech
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);

  const slides = [
    {
      image: require('../assets/images/delizar1.png'),
      speech: 'Bienvenido a Natelly, tu app de ayuda visual. Desliza para continuar.' // ← NUEVO
    },
    {
      image: require('../assets/images/deslizar2.png'),
      speech: 'Identifica objetos fácilmente con un solo clic.' // ← NUEVO
    },
  ];

  // ← NUEVO: Función para hablar
  const speak = (text) => {
    Speech.speak(text, {
      language: 'es',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  // ← NUEVO: Hablar cuando cambia de slide
  useEffect(() => {
    if (slides[currentSlide]) {
      speak(slides[currentSlide].speech);
    }
  }, [currentSlide]);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const goToMainMenu = () => {
    speak('Empezar'); // ← NUEVO: Hablar antes de navegar
    
    // ← NUEVO: Pequeña pausa para que termine de hablar
    setTimeout(() => {
      router.push('/main-menu');
    }, 800);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Image 
              source={slide.image} 
              style={styles.slideImage}
            />
          </View>
        ))}
      </ScrollView>

      {/* Botón ENCIMA de los puntos */}
      {currentSlide === slides.length - 1 && (
        <TouchableOpacity style={styles.startButton} onPress={goToMainMenu}>
          <Text style={styles.startButtonText}>Empezar</Text>
        </TouchableOpacity>
      )}

      {/* Puntos DEBAJO del botón */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentSlide === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  startButton: {
    backgroundColor: '#4f49e8',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 25,
    marginHorizontal: 40,
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    zIndex: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    zIndex: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default WelcomeScreen;
```
   
    
   
   





