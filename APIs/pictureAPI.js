const { getImage, imageSender } = require('../services/pictureServices');

const getPicture = async (req, res) => {
    const imgName = req.params.name;
    const img = await getImage(imgName);
    if (img) {
        res.status(200).send(img);
    } else {
        res.status(404).send('Image not found');
    }
}



module.exports = {
    getPicture
}