import DiscordSDKWrapper from './sdk.js';

const CLIENT_ID = 'TU_CLIENT_ID_REAL'; // Obtener del portal de desarrolladores

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const sdkWrapper = new DiscordSDKWrapper(CLIENT_ID);
    const discordSDK = await sdkWrapper.initialize();
    
    updateUI('SDK cargado correctamente');
    document.getElementById('auth-button').disabled = false;
    
    document.getElementById('auth-button').addEventListener('click', async () => {
      await handleAuthentication(discordSDK);
    });
    
  } catch (error) {
    console.error('Error inicializando SDK:', error);
    updateUI(`Error: ${error.message}`);
  }
});

async function handleAuthentication(sdk) {
  try {
    const { code } = await sdk.commands.authorize({
      client_id: CLIENT_ID,
      response_type: 'code',
      prompt: 'none',
      scope: ['identify', 'guilds', 'rpc.activities.write'],
    });
    
    updateUI('Autenticación exitosa');
    await startActivity(sdk, code);
    
  } catch (error) {
    console.error('Error en autenticación:', error);
    updateUI(`Error auth: ${error.message}`);
  }
}

async function startActivity(sdk, authCode) {
  try {
    // Implementar lógica para iniciar actividad
    // Ejemplo básico:
    await sdk.commands.startActivity({
      activity: {
        name: 'Mi Actividad',
        type: 0, // 0: Juego, 1: Streaming, 2: Escuchando
        details: "Detalles de la actividad",
        state: "Estado actual",
        assets: {
          large_image: 'imagen_grande',
          small_image: 'imagen_pequeña'
        }
      }
    });
    
    updateUI('Actividad iniciada!');
    
  } catch (error) {
    console.error('Error iniciando actividad:', error);
    updateUI(`Error actividad: ${error.message}`);
  }
}

function updateUI(message) {
  document.getElementById('sdk-state').textContent = message;
}
