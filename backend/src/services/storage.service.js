import ImageKit from '@imagekit/nodejs';
import { config } from '../config/config.js'
const client = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY 
});

export async function uploadFile({buffer,fileName,folder='rooms'}) {
    const result = await client.files.upload({
        file:await ImageKit.toFile(buffer),
        fileName,
        folder
    }); 
    
    return result
}

export async function deleteFile(fileId) {
    return await client.files.delete(fileId);
}