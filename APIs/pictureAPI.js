const { getImage, sendImage } = require('../services/pictureServices');

const getPictureBase64 = async (req, res) => {
    const imgName = req.params.name;
    const img = await getImage(imgName);
    if (img) {
        res.status(200).send(img);
    } else {
        res.status(404).send('Image not found');
    }
}

const sendPicture = async (req, res) => {
    const imgName = req.params.name;
    await sendImage(imgName, res);
}



module.exports = {
    getPictureBase64, sendPicture
}