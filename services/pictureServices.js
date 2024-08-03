const fse = require('fs-extra');
const path = require('path');
require("dotenv").config({ path: './projectParameter.env' });

const saveImage = async (image) => {
    const imageName = image.originalname.split('.')[0];
    const extension = image.originalname.split('.').pop();
    let newImageName = `${imageName}_${new Date().toISOString().replace(/:/g, '-').replace(/T/g, '_').substring(0, 19)}.${extension}`;
    let imageSource = path.join(process.env.PICTURE_PATH, newImageName);
    try {
        await fse.writeFile(imageSource, image.buffer);
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Picture ' + newImageName + ' saved successfully');
    } catch (savingError) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: An error occured during saving picure ' + newImageName + ' with traceback: \n', savingError);
        newImageName = null;
        imageSource = null;
        throw {
            code: 'SYS-ERR',
            message: 'System error during saving image'
        }
    } finally {
        return {
            "pictureName": newImageName,
            "imageSource": imageSource
        }
    }
}

const getImage = async (imgName) => {
    const imgPath = path.join(process.env.PICTURE_PATH, imgName);
    try {
        const img = await fse.readFileSync(imgPath);
        return Buffer.from(img).toString('base64');
    } catch (err) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', err);
        return null;
    }
}

const sendImage = async (imgName, res) => {
    const imgPath = path.join(String(process.env.PICTURE_PATH), String(imgName));
    try {
        const img = await fse.readFileSync(imgPath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(img, 'binary');
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Picture ' + imgName + ' sent successfully');
    } catch (err) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', err);
        res.status(404).send({
            code: 'PICTURE_NOT_FOUND',
            message: 'Picture not found'
        });
        return;
    }
}

const unlinkImage = async (imgName) => {
    const imgPath = path.join(process.env.PICTURE_PATH, imgName);
    try {
        await fs.unlink(imgPath);
    } catch (err) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', err);
        return {
            code: 'UNLINK-ERR',
            message: 'Error during unlinking image'
        }
    }
}

module.exports = {
    saveImage,
    getImage,
    sendImage,
    unlinkImage
}