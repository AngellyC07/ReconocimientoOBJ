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
Una vez dentro del entorno nos dirijimmos con el usuario a la raiz y a home con el comando:

sudo su

1.3 Creación del entorno para el proyecto

Creamos la carpeta del proyecto

mkdir proyecto

Accedemos a la carpeta

cd proyecto


   
1.2 Configuración del Bitvise para el entorno

![image](https://github.com/user-attachments/assets/fdd30aa4-d040-42eb-ba77-f3c18517baa1)

Una vez realizada la conexión se importa el modelo a utilizar que es el best.pt a la carpeta proyecto previamente creada.


------------------------------------------------------

2. Frontend – React Native


