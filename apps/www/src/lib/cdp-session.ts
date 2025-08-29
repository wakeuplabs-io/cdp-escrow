import { generateJwt } from '@coinbase/cdp-sdk/auth';

/**
 * Generates a JWT token for CDP API authentication using the CDP SDK
 * @param keyName - The CDP API key name
 * @param keySecret - The CDP API private key
 * @returns Promise of signed JWT token
 */
export async function generateJWT(keyName: string, keySecret: string): Promise<string> {
  const requestMethod = 'POST';
  const requestHost = 'api.developer.coinbase.com';
  const requestPath = '/onramp/v1/token';
  
  try {
    // Use the CDP SDK to generate the JWT
    const token = await generateJwt({
      apiKeyId: keyName,
      apiKeySecret: keySecret,
      requestMethod: requestMethod,
      requestHost: requestHost,
      requestPath: requestPath,
      expiresIn: 120 // optional (defaults to 120 seconds)
    });
    
    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw error;
  }
}
