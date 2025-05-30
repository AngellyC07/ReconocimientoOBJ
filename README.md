# Asistente de Limitantes Visuales para Reconocimiento de Objetos del Laboratorio Smart Center de la Unab
Nathalia Quintero - Angelly Cristancho

------------------------------------------------
Desarrollo de una aplicación móvil para Android que captura imágenes y las envía a un servidor backend desplegado en Azure mediante una API REST. El servidor procesa las imágenes utilizando el modelo de detección de objetos YOLOv8 previamente entrenado y devuelve las predicciones a la aplicación, que las muestra al usuario en tiempo real

-------------------------------------------------
# **1. Backend – FastAPI en Azure (Ubuntu Server 24.04 LTS)**
## **1.1 Crear y configurar la máquina virtual en Azure.**

Accedemos al portal: https://portal.azure.com

Creamos una nueva máquina virtual con:

![image](https://github.com/user-attachments/assets/2488ed5d-1b26-4618-bc7c-f2f34486385a)


Grupo de recursos: personalizado. Nombre de la VM: libre. Región: East US (predeterminada). Zona: 1. Imagen: Ubuntu Server 24.04 LTS. Tipo de autenticación: Clave pública SSH. Puertos abiertos: SSH (22) y más adelante el puerto de la API (8080).

## **1.2 Conexión Bitvise**

Ingresamos los datos de la máquina virtual y conectamos

![image](https://github.com/user-attachments/assets/f20b988f-70d9-4af9-b1ac-1d5f2a973f3e)


Una vez dentro del entorno nos dirigimos a home

```python
sudo su
```

vemos las carpetas
```python
ls -la
```

Vemos la versión de python
```python
python3 -V
```

Si se requiere, se actualiza paquetes
```python
apt update -y
```

Si se requiere, instalamos pip y virtualenv
```python
apt install python3-pip python3-venv -y
```

## **1.3 Entorno del proyecto**

Creamos la carpeta del proyecto
```python
mkdir proyecto
```

Accedemos a la carpeta
```python
cd proyecto
```

Creamos y activamos el entorno virtual
```python
python3 -m venv venv source venv/bin/activate
```

Instalaciones requeridas
```python
pip install fastapi uvicorn ultralytics pip install python-multipart pip install pillow
```

## **1.4 Traspaso del modelo .pt**

Se importa el modelo a utilizar que es el best.pt a la carpeta proyecto previamente creada.

![image](https://github.com/user-attachments/assets/9d0e8cd6-e2ad-4e37-86c1-48d978817eb9)

## **1.5 Creación de la API FastAPI**

Creamos un archivo app.py en la máquina virtual de Azure que contiene el backend con FastAPI para servir las predicciones del modelo YOLOv8.
```python
nano app.py
```

Código del Backend con FastAPI y YOLOv8 
Desarrollo del Backend API Usaremos FastAPI por su rendimiento y facilidad de uso. El backend aceptará una imagen, la procesará con el modelo YOLOv8 best.pt y devolverá la predicción.

```python
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

# Ejecutar el servidor
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

    
Se verificó que el archivo fue creado
```python
ls -la
```

## **1.5 Ejecutar servidor FastAPI**

Para ejecutar el servidor de FastAPI, se usa Uvicorn
```python
uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```

![image](https://github.com/user-attachments/assets/cc151a4f-761c-4118-a4c2-d20c4b05ecb0)


## **1.6 Prueba de Backend**

Prueba manual: Usando Postman

Entramos en el siguiente enlance https://www.postman.com y se ingresa la cuenta

Un vez dentro, Da click en new request

![image](https://github.com/user-attachments/assets/67cd21eb-b736-4126-a2dc-323e5eb9dc76)


Llenar los siguientes datos

![image](https://github.com/user-attachments/assets/76dd01fd-a7b0-4066-98eb-68c7c4fea00b)


Colocamos la dirección IP de la máquina virtual acompañada con el :8080 que es el puerto y con el /predict que es el endpoint que queremos probar.

![image](https://github.com/user-attachments/assets/f5667903-0dad-4e96-9752-4ed643009799)


![image](https://github.com/user-attachments/assets/9a133d37-a8ff-4c5d-871a-0c94f127cba2)


La API estará disponible en http://172.200.240.238:8080/predict/

------------------------------------------------------

# **2. Frontend – React Native**

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
![image](https://github.com/user-attachments/assets/6cdd74e7-fbea-4013-99db-12677b151ed0)
![image](https://github.com/user-attachments/assets/6d668206-d685-4728-a78c-a88e32b74f25)

### **2.3.2 Menú Principal (main-menu-screen.js)**

El menú principal implementa un **diseño responsivo** con **características de accesibilidad avanzadas**.

#### **Características Técnicas:**

- **Diseño Responsivo:** Utiliza `Dimensions.get("window")` para adaptarse a diferentes tamaños de pantalla
- **Modo Accesibilidad:** Sistema de navegación por voz con doble toque
- **Feedback Háptico:** Vibración para confirmar acciones
- **Síntesis de Voz:** Mensajes hablados en español
  
```python
"use client"

import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Speech from "expo-speech"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"

const { width, height } = Dimensions.get("window")

// Función para calcular tamaños responsivos
const getResponsiveSize = (baseSize) => {
  const scale = Math.min(width / 375, height / 667) // Base: iPhone 6/7/8
  return Math.max(baseSize * scale, baseSize * 0.8) // Mínimo 80% del tamaño base
}

const MainMenuScreen = ({ navigation }) => {
  // Estado para el modo accesibilidad
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  // Estado para el elemento enfocado actualmente (-1 significa ninguno)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  // Referencia para el tiempo del último toque (para detectar doble toque)
  const lastTapRef = useRef(0)
  // Referencia para el último botón tocado
  const lastTouchedButtonRef = useRef(-1)
  // Valor animado para el elemento enfocado
  const focusAnim = useRef(new Animated.Value(1)).current

  // Opciones del menú
  const menuOptions = [
    {
      title: "Tomemos una foto",
      subtitle: "Usa tu cámara para capturar momentos",
      icon: "camera",
      onPress: () => {
        vibrateDevice()
        speakText("Abriendo cámara")
        setTimeout(() => {
          router.push("/camera")
        }, 1000)
      },
      color: "#5049e5",
      shadowColor: "#5049e5",
    },
    {
      title: "Carguemos una foto",
      subtitle: "Selecciona desde tu galería",
      icon: "images",
      onPress: () => {
        vibrateDevice()
        speakText("Abriendo galería")
        setTimeout(() => {
          router.push("/gallery")
        }, 1000)
      },
      color: "#9989c0",
      shadowColor: "#9989c0",
    },
    {
      title: "Cómo usar la app",
      subtitle: "Guía paso a paso para usar todas las funciones",
      icon: "book",
      onPress: () => {
        vibrateDevice()
        speakText("Abriendo información")
        setTimeout(() => {
          router.push("/about")
        }, 1000)
      },
      color: "#453589",
      shadowColor: "#453589",
    },
  ]

  // Función para reproducir texto por voz
  const speakText = (text) => {
    Speech.speak(text, {
      language: "es",
      pitch: 1.0,
      rate: 0.9,
    })
  }

  // Función para vibrar el dispositivo
  const vibrateDevice = () => {
    Vibration.vibrate(100)
  }

  // Función para activar/desactivar el modo accesibilidad
  const toggleAccessibilityMode = () => {
    const newMode = !accessibilityMode
    setAccessibilityMode(newMode)

    if (newMode) {
      speakText("Modo accesibilidad activado. Toque una vez para escuchar, doble toque para seleccionar.")
      setFocusedIndex(0) // Enfocar el primer elemento
    } else {
      speakText("Modo accesibilidad desactivado")
      setFocusedIndex(-1)
    }
  }

  // Función para manejar el enfoque de un elemento
  const focusItem = (index) => {
    if (index >= 0 && index < menuOptions.length) {
      setFocusedIndex(index)

      // Animar el elemento enfocado
      Animated.sequence([
        Animated.timing(focusAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(focusAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      // Vibrar suavemente
      Vibration.vibrate(50)
    }
  }

  // Función para manejar el toque en un botón específico
  const handleButtonTouch = (index) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 400

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY && lastTouchedButtonRef.current === index) {
      // Doble toque en el mismo botón - ejecutar acción
      Speech.stop()
      menuOptions[index].onPress()
    } else {
      // Toque simple - enfocar y leer
      focusItem(index)
      lastTouchedButtonRef.current = index
      Speech.stop()
      setTimeout(() => {
        speakText(menuOptions[index].title)
      }, 100)
    }

    lastTapRef.current = now
  }

  // Reproducir mensaje de bienvenida al cargar la pantalla
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText(
        "Menú principal. ¿Cómo quieres subir la foto? Mantén presionado el botón de accesibilidad para activar el modo especial.",
      )
    }, 500)

    return () => {
      clearTimeout(timer)
      Speech.stop()
    }
  }, [])

  // Efecto para enfocar el primer elemento cuando se activa el modo accesibilidad
  useEffect(() => {
    if (accessibilityMode && focusedIndex === 0) {
      // Pequeño retraso para que termine de hablar el mensaje de activación
      setTimeout(() => {
        focusItem(0)
        // Leer el primer elemento automáticamente
        setTimeout(() => {
          speakText(menuOptions[0].title)
        }, 500)
      }, 2000)
    }
  }, [accessibilityMode])

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con el color azul oscuro */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}> </Text>
        <Text style={styles.headerTitle}>¡Estamos aquí para ayudarte!</Text>
        <Text style={styles.headerSubtitle}>Selecciona como subirás tu foto</Text>

        {/* Botón de accesibilidad */}
        <TouchableOpacity
          style={styles.accessibilityButton}
          onLongPress={toggleAccessibilityMode}
          delayLongPress={3000}
        >
          <Ionicons name={accessibilityMode ? "eye" : "eye-outline"} size={getResponsiveSize(24)} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        {menuOptions.map((option, index) => (
          <Animated.View
            key={index}
            style={[
              focusedIndex === index && accessibilityMode
                ? {
                    transform: [{ scale: focusAnim }],
                    borderWidth: 3,
                    borderColor: "#fff",
                    borderRadius: getResponsiveSize(28),
                  }
                : {},
            ]}
          >
            <TouchableOpacity
              style={[
                styles.menuButton,
                {
                  backgroundColor: option.color,
                  shadowColor: option.shadowColor,
                },
              ]}
              onPress={() => {
                if (accessibilityMode) {
                  // En modo accesibilidad, manejar toque simple/doble
                  handleButtonTouch(index)
                } else {
                  // Modo normal, ejecutar directamente
                  option.onPress()
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel={option.title}
              accessibilityHint={option.subtitle}
              accessibilityRole="button"
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={option.icon} size={getResponsiveSize(45)} color="white" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.buttonTitle}>{option.title}</Text>
                  <Text style={styles.buttonSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {accessibilityMode && (
        <View style={styles.accessibilityInstructions}>
          <Text style={styles.accessibilityText}>Modo accesibilidad activado</Text>
          <Text style={styles.accessibilitySubtext}>• Toque simple: Escuchar nombre del botón</Text>
          <Text style={styles.accessibilitySubtext}>• Doble toque: Abrir la opción seleccionada</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    paddingTop: Math.max(height * 0.06, 30), // Responsivo basado en altura
    paddingHorizontal: width * 0.067, // ~25px en pantalla de 375px
    paddingBottom: Math.max(height * 0.05, 25), // Responsivo basado en altura
    backgroundColor: "#1c1964",
    borderBottomLeftRadius: getResponsiveSize(35),
    borderBottomRightRadius: getResponsiveSize(35),
    marginBottom: Math.max(height * 0.035, 20), // Responsivo basado en altura
    elevation: 8,
    shadowColor: "#1c1964",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: "relative",
  },
  headerTitle: {
    fontSize: getResponsiveSize(26), // Reducido de 28
    fontWeight: "bold",
    color: "white",
    marginBottom: getResponsiveSize(12),
    textAlign: "center",
    lineHeight: getResponsiveSize(32), // Reducido de 34
  },
  headerSubtitle: {
    fontSize: getResponsiveSize(16), // Reducido de 18
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: getResponsiveSize(22), // Reducido de 24
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: width * 0.067, // ~25px en pantalla de 375px
    justifyContent: "center",
    paddingVertical: height * 0.02, // Padding vertical responsivo
  },
  menuButton: {
    marginVertical: Math.max(height * 0.012, 8), // Reducido de 12
    borderRadius: getResponsiveSize(25),
    elevation: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    minHeight: Math.max(height * 0.12, 85), // Reducido de 110, mínimo 85
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Math.max(height * 0.025, 18), // Reducido de 25
    paddingHorizontal: width * 0.067, // ~25px en pantalla de 375px
  },
  iconContainer: {
    marginRight: getResponsiveSize(18), // Reducido de 20
    alignItems: "center",
    justifyContent: "center",
    width: getResponsiveSize(60), // Reducido de 70
    height: getResponsiveSize(60), // Reducido de 70
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: getResponsiveSize(18), // Reducido de 20
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  buttonTitle: {
    fontSize: getResponsiveSize(22), // Reducido de 24
    fontWeight: "bold",
    color: "white",
    marginBottom: getResponsiveSize(5), // Reducido de 6
    lineHeight: getResponsiveSize(28), // Reducido de 30
  },
  buttonSubtitle: {
    fontSize: getResponsiveSize(14), // Reducido de 16
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
    lineHeight: getResponsiveSize(20), // Reducido de 22
  },
  footer: {
    paddingVertical: getResponsiveSize(25),
    paddingHorizontal: getResponsiveSize(30),
    alignItems: "center",
  },
  accessibilityButton: {
    position: "absolute",
    top: Math.max(height * 0.06, 30), // Responsivo basado en altura
    right: width * 0.053, // ~20px en pantalla de 375px
    width: getResponsiveSize(44),
    height: getResponsiveSize(44),
    borderRadius: getResponsiveSize(22),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  accessibilityInstructions: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: getResponsiveSize(20),
    borderRadius: getResponsiveSize(15),
    margin: getResponsiveSize(20),
  },
  accessibilityText: {
    color: "white",
    fontSize: getResponsiveSize(16), // Reducido de 18
    fontWeight: "bold",
    marginBottom: getResponsiveSize(10),
    textAlign: "center",
  },
  accessibilitySubtext: {
    color: "white",
    fontSize: getResponsiveSize(13), // Reducido de 14
    marginBottom: getResponsiveSize(5),
  },
})

export default MainMenuScreen
```
![image](https://github.com/user-attachments/assets/9216a7a1-fc64-4c71-bf88-e0bc005aaaec)
Al mantener precionado el boton superior se activa modo accesibilidad
![image](https://github.com/user-attachments/assets/ddc37ef3-45d0-4789-b01c-69e7ef25ce27)

### **2.3.2 Pantalla de Cámara (camera-screen.js)**

#### **Funcionalidades Implementadas:**

- **Captura de Imágenes:** Utilizando `expo-camera` con calidad optimizada
- **Conexión con API:** Envío automático de imágenes al backend
- **Procesamiento de Respuestas:** Manejo de predicciones del modelo YOLO8
- **Interfaz de Usuario:** Modal informativo con detalles del objeto
```python
"use client"

import axios from 'axios'; // Importa axios para las peticiones HTTP
import { CameraView, useCameraPermissions } from "expo-camera"; // Importa componentes y hooks de la cámara de Expo
import { router } from "expo-router"; // Importa el router de Expo para la navegación entre pantallas
import * as Speech from "expo-speech"; // Importa la librería de Expo para la síntesis de voz (text-to-speech)
import { useEffect, useRef, useState } from "react"; // Importa hooks de React para la gestión del estado y efectos secundarios, y useRef para referenciar componentes
import { Alert, Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"; // Importa componentes y módulos de React Native para la interfaz de usuario

export default function CameraScreen() {
  // Estados para la gestión de la interfaz de usuario y los datos
  const [photo, setPhoto] = useState(null); // Estado para almacenar los datos de la foto tomada (URI, base64, etc.)
  const [predictionResult, setPredictionResult] = useState(null); // Estado para almacenar el resultado de la predicción del backend
  const [permission, requestPermission] = useCameraPermissions(); // Hook para gestionar los permisos de la cámara
  const [accessibilityMode, setAccessibilityMode] = useState(false); // Estado para controlar el modo de accesibilidad (actualmente no implementado completamente)
  const [showObjectInfo, setShowObjectInfo] = useState(false); // Estado para controlar la visibilidad del modal de información del objeto
  const cameraRef = useRef(null); // Referencia al componente CameraView para interactuar con la cámara
  const [objectDescription, setObjectDescription] = useState("Descripción no disponible."); // Estado para almacenar la descripción del objeto detectado

  // Función para reproducir texto por voz
  const speakText = (text) => {
    Speech.speak(text, {
      language: "es",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  // Función para vibrar el dispositivo
  const vibrateDevice = () => {
    Vibration.vibrate(100);
  };

  // Efecto para obtener el estado del modo accesibilidad al montar el componente
  useEffect(() => {
    setAccessibilityMode(false); // Simulación: aquí iría la lógica para cargar el estado de accesibilidad persistido
  }, []); // El array de dependencias vacío asegura que esto solo se ejecute una vez

  // Efecto para el mensaje de bienvenida al cargar la pantalla
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText("Posiciona el objeto en el cuadrado y toca el botón para capturar");
    }, 500);

    // Función de limpieza del efecto: cancela el timeout y detiene la síntesis de voz si el componente se desmonta
    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, []); // El array de dependencias vacío asegura que esto solo se ejecute una vez

  // Función asíncrona para tomar una foto
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        vibrateDevice();
        // Toma una foto con la cámara y obtiene sus datos
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true, // Se incluye base64 aunque no se use directamente en la función sendToBackend actual
        });
        setPhoto(photoData); // Actualiza el estado con los datos de la foto
        await sendToBackend(photoData.base64, photoData.uri); // Llama a la función para enviar la foto al backend, pasando el URI
      } catch (error) {
        Alert.alert("Error", "No se pudo tomar la foto. Inténtalo de nuevo.");
      }
    }
  };

  // Función asíncrona para enviar la imagen al backend para la predicción
  const sendToBackend = async (base64Image, imageUri) => { // Recibe la imagen en base64 (no se usa directamente ahora) y su URI
    if (!imageUri) {
      Alert.alert("Error", "URI de la imagen no disponible.");
      return;
    }

    const apiUrl = 'http://172.200.240.238:8080/predict/'; // URL del endpoint de predicción del backend
    const formData = new FormData(); // Crea un objeto FormData para enviar archivos

    // Añade la imagen al FormData utilizando su URI
    formData.append('file', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      // Realiza una petición POST al backend con la imagen
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Respuesta del backend:", response.data);
      // Si la respuesta contiene detecciones, actualiza el estado con el primer resultado y habla el nombre del objeto
      if (response.data && response.data.detections && response.data.detections.length > 0) {
        setPredictionResult(response.data.detections[0]);
        speakText(`Se detectó ${response.data.detections[0]?.nombre} con una confianza de ${(response.data.detections[0]?.confidence * 100).toFixed(2)} por ciento.`);
      } else {
        speakText("No se detectó ningún objeto.");
        setPredictionResult(null);
      }
    } catch (error) {
      console.error("Error al enviar la imagen al backend:", error);
      Alert.alert("Error", "No se pudo contactar al servidor. Asegúrate de que la IP y el puerto sean correctos y el servidor esté funcionando.");
      speakText("Error al contactar al servidor.");
      setPredictionResult(null);
    }
  };

  // Función para volver a tomar la foto, reseteando el estado de la foto y la predicción
  const retakePicture = () => {
    setPhoto(null);
    setPredictionResult(null); // Limpia el resultado de la predicción anterior
    speakText("Toma otra foto");
  };

  // Función para mostrar el modal con los detalles del objeto detectado
  const showObjectDetails = () => {
    vibrateDevice();
    setShowObjectInfo(true);
    // Si hay un resultado de predicción con un nombre, busca su descripción en classLabels
    if (predictionResult?.nombre) {
      let description = "Descripción no disponible.";
      for (const key in classLabels) {
        if (classLabels[key]?.nombre === predictionResult.nombre) {
          description = classLabels[key]?.descripcion || "Descripción no disponible.";
          break;
        }
      }
      speakText(`Información del objeto. ${predictionResult.nombre}. ${description}`);
      setObjectDescription(description); // Actualiza el estado de la descripción para mostrarla en el modal
    } else {
      speakText("No hay información del objeto detectado.");
    }
  };

  // Función para cerrar el modal de información del objeto
  const closeObjectInfo = () => {
    setShowObjectInfo(false);
    speakText("Información cerrada");
  };

  // Función para navegar de vuelta a la pantalla anterior
  const goBack = () => {
    vibrateDevice();
    speakText("Regresando al menú principal");
    setTimeout(() => {
      router.back();
    }, 500);
  };

  // Diccionario de clases que mapea los IDs de predicción a nombres y descripciones de objetos (copiado de la API)
  const classLabels = {
    0: {"nombre": "Microscopio óptico avanzado", "descripcion": "Permite observar muestras pequeñas con luz y lentes."},
    1: {"nombre": "Agitador magnético con placa calefactora", "descripcion": "Mezcla y calienta líquidos en laboratorios."},
    2: {"nombre": "Aire acondicionado YORK", "descripcion": "Regula temperatura y aire en espacios cerrados."},
    3: {"nombre": "Cafetera", "descripcion": "Prepara café automáticamente con agua caliente."},
    4: {"nombre": "Computador", "descripcion": "Procesa información y ejecuta programas."},
    5: {"nombre": "Control remoto de robot", "descripcion": "Permite manejar un robot a distancia."},
    6: {"nombre": "Control remoto de Smart TV", "descripcion": "Mando para controlar funciones del televisor."},
    7: {"nombre": "Estación de soldadura por aire caliente", "descripcion": "Para soldar componentes con aire caliente."},
    8: {"nombre": "Impresora 3D Creality K1 Max", "descripcion": "Crea objetos 3D a partir de diseños digitales."},
    9: {"nombre": "Mini fresadora CNC", "descripcion": "Corta o talla materiales controlada por computadora."},
    10: {"nombre": "Mouse", "descripcion": "Dispositivo para interactuar con la computadora."},
    11: {"nombre": "Osciloscopio digital Rigol DS1202ZE", "descripcion": "Visualiza señales eléctricas como ondas."},
    12: {"nombre": "Puerta", "descripcion": "Permite o restringe el acceso a espacios."},
    13: {"nombre": "Robot humanoide AULER", "descripcion": "Robot con forma y movimientos similares a un humano."},
    14: {"nombre": "Robot LEGO Mindstorms EV3", "descripcion": "Kit educativo para construir y programar robots."},
    15: {"nombre": "Router", "descripcion": "Distribuye internet a múltiples dispositivos."},
    16: {"nombre": "Sensor de suelo integrado", "descripcion": "Mide humedad y temperatura del suelo."},
    17: {"nombre": "Tablet", "descripcion": "Dispositivo táctil portátil con múltiples funciones."},
    18: {"nombre": "Tomacorrientes 110V", "descripcion": "Permite conectar aparatos a la red eléctrica."},
    19: {"nombre": "UPS Netio", "descripcion": "Suministro de energía en caso de cortes eléctricos."}
  };

  // Renderizado condicional: si no se tienen los permisos de la cámara
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Cargando cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizado condicional: si los permisos de la cámara no están concedidos
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionText}>Necesitamos acceso a tu cámara para tomar fotos</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              vibrateDevice();
              speakText("Permitir Cámara");
              requestPermission(); // Solicita los permisos de la cámara
            }}
          >
            <Text style={styles.buttonText}>Permitir Cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => {
              vibrateDevice();
              speakText("Volver al Menú");
              goBack(); // Navega de vuelta a la pantalla anterior
            }}
          >
            <Text style={styles.buttonText}>Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizado condicional: si ya se tomó la foto
  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              vibrateDevice();
              speakText("Volver a tomar foto");
              retakePicture(); // Permite al usuario tomar otra foto
            }}
          >
            <Text style={styles.headerButton}>← Otra foto</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Objeto Detectado</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.photoContainer}>
          <Image source={{ uri: photo.uri }} style={styles.photo} />
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            {predictionResult ? `Objeto: ${predictionResult.nombre}` : "Analizando..."}
          </Text>
          {predictionResult?.confidence && (
            <Text style={styles.messageSubtext}>
              Confianza: {(predictionResult.confidence * 100).toFixed(2)}%
            </Text>
          )}
          {!predictionResult && <Text style={styles.messageSubtext}>Por favor espera...</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={retakePicture}
          >
            <Text style={styles.actionButtonText}>Tomar otra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={showObjectDetails}
            disabled={!predictionResult} // Deshabilita el botón si aún no hay resultado de predicción
          >
            <Text style={styles.actionButtonText}>Conocer más</Text>
          </TouchableOpacity>
        </View>

        {/* Modal con información del objeto */}
        <Modal visible={showObjectInfo} transparent={true} animationType="slide" onRequestClose={closeObjectInfo}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {predictionResult ? `💻 ${predictionResult.nombre}` : "Información"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    vibrateDevice();
                    speakText("Cerrar información");
                    closeObjectInfo(); // Cierra el modal de información
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {predictionResult?.nombre ? (
                  <Text style={styles.objectDescription}>
                    {objectDescription}
                  </Text>
                ) : (
                  <Text style={styles.objectDescription}>No hay información disponible del objeto.</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  vibrateDevice();
                  speakText("Cerrar");
                  closeObjectInfo(); // Cierra el modal
                }}
              >
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Renderizado de la pantalla de la cámara
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            vibrateDevice();
            speakText("Volver al menú");
            goBack(); // Navega de vuelta al menú principal
          }}
        >
          <Text style={styles.headerButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tomar Foto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Posiciona el objeto en el cuadrado y toca el botón para capturar</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <View style={styles.cameraFrame} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={() => {
            speakText("Capturando foto");
            takePicture(); // Llama a la función para tomar la foto
          }}
        >
          <View style={styles.captureButtonInner}>
            <Text style={styles.captureButtonText}>📸</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.captureHint}>Toca para capturar</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerButton: {
    fontSize: 18,
    color: "#1c1964",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1964",
  },
  headerSpacer: {
    width: 60,
  },
  instructionContainer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: "#5049e5",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 22,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraFrame: {
    position: "absolute",
    top: "20%",
    left: "15%",
    right: "15%",
    bottom: "20%",
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 15,
    backgroundColor: "transparent",
  },
  controls: {
    paddingVertical: 30,
    alignItems: "center",
  },
  captureButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#5049e5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#5049e5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  captureButtonInner: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonText: {
    fontSize: 35,
  },
  captureHint: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    fontWeight: "500",
  },
  photoContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  photo: {
    flex: 1,
    width: "100%",
  },
  messageContainer: {
    backgroundColor: "#9989c0",
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  messageText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 5,
  },
  messageSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButton: {
    backgroundColor: "#5049e5",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 0.45,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#453589",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#5049e5",
    fontWeight: "600",
  },
  permissionText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#5049e5",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    minWidth: 200,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#9989c0",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 0,
    width: "100%",
    maxWidth: 400,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#5049e5",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  objectDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "justify",
  },
  objectFeatures: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c1964",
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: "#5049e5",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

```
*Ojo no olvides los permisos para que permita activar camara*

### **2.3.3 Pantalla de Galería (gallery-screen.js)**

#### **Implementación de Selección de Imágenes:**

La funcionalidad es muy similar a la de tomar foto, solo que aqui selecionamos una foto del dispositivo

```python
"use client"

import axios from 'axios'; // Importa la librería axios para hacer peticiones HTTP
import * as ImagePicker from "expo-image-picker"; // Importa la librería de Expo para seleccionar imágenes
import { router } from "expo-router"; // Importa el router de Expo para la navegación
import * as Speech from "expo-speech"; // Importa la librería de Expo para la síntesis de voz
import { useEffect, useState } from "react"; // Importa hooks de React para la gestión del estado y efectos
import { Alert, Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"; // Importa componentes y módulos de React Native

export default function GalleryScreen() {
  // Estados para la gestión de la interfaz de usuario y los datos
  const [selectedImage, setSelectedImage] = useState(null); // Estado para almacenar la URI de la imagen seleccionada
  const [showObjectInfo, setShowObjectInfo] = useState(false); // Estado para controlar la visibilidad del modal de información del objeto
  const [predictionResult, setPredictionResult] = useState(null); // Estado para almacenar el resultado de la predicción de la API
  const [objectDescription, setObjectDescription] = useState("Descripción no disponible."); // Estado para almacenar la descripción del objeto detectado

  // Diccionario de clases que mapea los IDs de predicción a nombres y descripciones de objetos
  const classLabels = {
    0: {"nombre": "Microscopio óptico avanzado", "descripcion": "Permite observar muestras pequeñas con luz y lentes."},
    1: {"nombre": "Agitador magnético con placa calefactora", "descripcion": "Mezcla y calienta líquidos en laboratorios."},
    2: {"nombre": "Aire acondicionado YORK", "descripcion": "Regula temperatura y aire en espacios cerrados."},
    3: {"nombre": "Cafetera", "descripcion": "Prepara café automáticamente con agua caliente."},
    4: {"nombre": "Computador", "descripcion": "Procesa información y ejecuta programas."},
    5: {"nombre": "Control remoto de robot", "descripcion": "Permite manejar un robot a distancia."},
    6: {"nombre": "Control remoto de Smart TV", "descripcion": "Mando para controlar funciones del televisor."},
    7: {"nombre": "Estación de soldadura por aire caliente", "descripcion": "Para soldar componentes con aire caliente."},
    8: {"nombre": "Impresora 3D Creality K1 Max", "descripcion": "Crea objetos 3D a partir de diseños digitales."},
    9: {"nombre": "Mini fresadora CNC", "descripcion": "Corta o talla materiales controlada por computadora."},
    10: {"nombre": "Mouse", "descripcion": "Dispositivo para interactuar con la computadora."},
    11: {"nombre": "Osciloscopio digital Rigol DS1202ZE", "descripcion": "Visualiza señales eléctricas como ondas."},
    12: {"nombre": "Puerta", "descripcion": "Permite o restringe el acceso a espacios."},
    13: {"nombre": "Robot humanoide AULER", "descripcion": "Robot con forma y movimientos similares a un humano."},
    14: {"nombre": "Robot LEGO Mindstorms EV3", "descripcion": "Kit educativo para construir y programar robots."},
    15: {"nombre": "Router", "descripcion": "Distribuye internet a múltiples dispositivos."},
    16: {"nombre": "Sensor de suelo integrado", "descripcion": "Mide humedad y temperatura del suelo."},
    17: {"nombre": "Tablet", "descripcion": "Dispositivo táctil portátil con múltiples funciones."},
    18: {"nombre": "Tomacorrientes 110V", "descripcion": "Permite conectar aparatos a la red eléctrica."},
    19: {"nombre": "UPS Netio", "descripcion": "Suministro de energía en caso de cortes eléctricos."}
  };

  // Función para reproducir texto por voz
  const speakText = (text) => {
    Speech.speak(text, {
      language: "es",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  // Función para vibrar el dispositivo
  const vibrateDevice = () => {
    Vibration.vibrate(100);
  };

  // Efecto que se ejecuta al cargar la pantalla para dar un mensaje de bienvenida por voz
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText("Selecciona una foto con el objeto para identificar");
    }, 500);

    // Función de limpieza del efecto: cancela el timeout y detiene la síntesis de voz si el componente se desmonta
    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, []); // El array vacío asegura que el efecto solo se ejecute una vez al montar el componente

  // Función asíncrona para enviar la imagen seleccionada al backend para la predicción
  const sendToBackend = async (imageUri) => {
    if (!imageUri) {
      Alert.alert("Error", "URI de la imagen no disponible.");
      return;
    }

    const apiUrl = 'http://172.200.240.238:8080/predict/'; // URL de la API para la predicción
    const formData = new FormData(); // Crea un objeto FormData para enviar archivos

    // Añade la imagen al FormData
    formData.append('file', {
      uri: imageUri,
      name: 'gallery_photo.jpg',
      type: 'image/jpeg',
    });

    try {
      // Realiza una petición POST a la API con la imagen
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Respuesta del backend (Galería):", response.data);
      // Si la API devuelve detecciones, actualiza el estado con el primer resultado
      if (response.data && response.data.detections && response.data.detections.length > 0) {
        setPredictionResult(response.data.detections[0]);
        speakText(`Se detectó ${response.data.detections[0]?.nombre} con una confianza de ${(response.data.detections[0]?.confidence * 100).toFixed(2)} por ciento.`);
      } else {
        speakText("No se detectó ningún objeto en la imagen.");
        setPredictionResult(null);
      }
    } catch (error) {
      console.error("Error al enviar la imagen al backend (Galería):", error);
      Alert.alert("Error", "No se pudo contactar al servidor. Asegúrate de que la IP y el puerto sean correctos y el servidor esté funcionando.");
      speakText("Error al contactar al servidor desde galería.");
      setPredictionResult(null);
    }
  };

  // Función asíncrona para abrir la galería y seleccionar una imagen
  const pickImage = async () => {
    vibrateDevice();
    speakText("Abriendo galería");

    // Solicita permisos para acceder a la galería de medios
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Si no se conceden los permisos, muestra una alerta
    if (permissionResult.granted === false) {
      Alert.alert("Permisos necesarios", "Necesitamos acceso a tu galería para seleccionar fotos", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Configuración",
          onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
        },
      ]);
      return;
    }

    // Abre la galería de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    // Si el usuario no cancela la selección, actualiza el estado con la imagen seleccionada y la envía al backend
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      sendToBackend(result.assets[0].uri);
    }
  };

  // Función para permitir al usuario seleccionar otra imagen, reiniciando los estados relacionados con la predicción
  const selectAnotherImage = () => {
    vibrateDevice();
    speakText("Elegir otra");
    setSelectedImage(null);
    setPredictionResult(null); // Limpia el resultado de la predicción anterior
    setObjectDescription("Descripción no disponible."); // Restablece la descripción del objeto
  };

  // Función para mostrar el modal con los detalles del objeto detectado
  const showObjectDetails = () => {
    vibrateDevice();
    setShowObjectInfo(true);
    // Si hay un resultado de predicción, busca la descripción en classLabels y la muestra
    if (predictionResult?.nombre) {
      let description = "Descripción no disponible.";
      for (const key in classLabels) {
        if (classLabels[key]?.nombre === predictionResult.nombre) {
          description = classLabels[key]?.descripcion || "Descripción no disponible.";
          break;
        }
      }
      speakText(`Información del objeto. ${predictionResult.nombre}. ${description}`);
      setObjectDescription(description);
    } else {
      speakText("No se detectó información del objeto.");
      setObjectDescription("No hay información disponible.");
    }
  };

  // Función para cerrar el modal de información del objeto
  const closeObjectInfo = () => {
    setShowObjectInfo(false);
    speakText("Información cerrada");
  };

  // Función para navegar de vuelta a la pantalla anterior
  const goBack = () => {
    vibrateDevice();
    speakText("Regresando al menú principal");
    setTimeout(() => {
      router.back();
    }, 500);
  };

  // Renderizado condicional: si se ha seleccionado una imagen y se ha obtenido un resultado de predicción
  if (selectedImage && predictionResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              vibrateDevice();
              speakText("Volver");
              goBack();
            }}
          >
            <Text style={styles.headerButton}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Objeto Detectado</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{predictionResult.nombre}</Text>
          {predictionResult?.confidence && (
            <Text style={styles.messageSubtext}>
              Confianza: {(predictionResult.confidence * 100).toFixed(2)}%
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              vibrateDevice();
              speakText("Elegir otra");
              selectAnotherImage();
            }}
          >
            <Text style={styles.actionButtonText}>Elegir otra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={showObjectDetails}
            disabled={!predictionResult}
          >
            <Text style={styles.actionButtonText}>Conocer más</Text>
          </TouchableOpacity>
        </View>

        {/* Modal con información del objeto */}
        <Modal visible={showObjectInfo} transparent={true} animationType="slide" onRequestClose={closeObjectInfo}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {predictionResult ? `🖼️ ${predictionResult.nombre}` : "Información"}
                </Text>
                <TouchableOpacity
                  onPress={closeObjectInfo}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.objectDescription}>
                  {objectDescription}
                </Text>
                {/* Puedes añadir más detalles aquí si lo deseas */}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeObjectInfo}
              >
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Renderizado inicial: pantalla para seleccionar una imagen de la galería
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            vibrateDevice();
            speakText("Volver");
            goBack();
          }}
        >
          <Text style={styles.headerButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cargar Foto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Selecciona una foto con el objeto para identificar</Text>
      </View>

      <View style={styles.galleryContainer}>
        <View style={styles.galleryPlaceholder}>
          <View style={styles.galleryIcon}>
            <Text style={styles.galleryEmoji}>🖼️</Text>
          </View>
          <Text style={styles.galleryTitle}>Galería de Fotos</Text>
          <Text style={styles.gallerySubtitle}>(Toca el botón para explorar tus fotos)</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={pickImage}
        >
          <View style={styles.selectButtonInner}>
            <Text style={styles.selectButtonText}>📱</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.selectHint}>Seleccionar Foto</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerButton: {
    fontSize: 18,
    color: "#1c1964",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1964",
  },
  headerSpacer: {
    width: 60,
  },
  instructionContainer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: "#5049e5",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 22,
  },
  galleryContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    backgroundColor: "#9989c0",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryPlaceholder: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  galleryIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  galleryEmoji: {
    fontSize: 50,
  },
  galleryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  gallerySubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  controls: {
    paddingVertical: 30,
    alignItems: "center",
  },
  selectButton: {
    width: 100, // Aumentado de 80 a 100
    height: 100, // Aumentado de 80 a 100
    borderRadius: 50, // Ajustado para mantener la forma circular
    backgroundColor: "#5049e5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#5049e5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  selectButtonInner: {
    width: 75, // Aumentado de 60 a 75
    height: 75, // Aumentado de 60 a 75
    borderRadius: 37.5, // Ajustado para mantener la forma circular
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 35, // Aumentado de 30 a 35
  },
  selectHint: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    fontWeight: "500",
  },
  imageContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  selectedImage: {
    flex: 1,
    width: "100%",
  },
  messageContainer: {
    backgroundColor: "#9989c0",
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  messageText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 5,
  },
  messageSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButton: {
    backgroundColor: "#5049e5",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 0.45,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#453589",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center", // Agregado para centrar el texto
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 0,
    width: "100%",
    maxWidth: 400,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#5049e5",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  objectDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "justify",
  },
  objectFeatures: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c1964",
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: "#5049e5",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center", // Agregado para centrar el texto
  },
});

```
## **2.4 Conexión Frontend-Backend**

### **2.4.1 Configuración de la Comunicación HTTP**

import axios from 'axios';
```python
// Configuración base de la API
const API_BASE_URL = 'http://172.200.240.238:8080';
const API_ENDPOINT = '/predict/';

// Configuración de timeout y headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos de timeout
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```



   





