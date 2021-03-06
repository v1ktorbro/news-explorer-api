const Article = require('../models/article');
const { NotFound, Forbidden } = require('../errors/index');

module.exports.getArticlesUser = (req, res, next) => {
  Article.find({ owner: req.user._id }).then((articles) => {
    if (!articles) {
      throw new NotFound('Не удалось загрузить статьи');
    }
    return res.status(200).send(articles);
  }).catch(next);
};

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  }).then((article) => res.status(201).send(article)).catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  const { id } = req.params;
  Article.findOne({ _id: id }).select('+owner').then((article) => {
    if (!article) {
      throw new NotFound('Карточка не существует, либо уже была удалена');
    }
    const ownerArticle = article.owner.toString();
    if (ownerArticle !== req.user._id) {
      throw new Forbidden('Вы не можете удалить чужую статью');
    }
    return Article.deleteOne({ _id: id }).then(() => res.status(200).send(`Карточка ${id} удалена`));
  }).catch(next);
};
