var models = require('../models/models.js');

// Autoload :id de comentarios
exports.load = function(req, res, next, commentId) {
//	models.Comment.findById( commentId ).then(function(comment) {
	models.Comment.find( {
		where: { id: Number(commentId) }
	} ).then(function(comment) {
		if (comment) {
			req.comment = comment;
			next();
		} else {
			next(new Error('No existe commentId= ' + commentId))
		}
	} ).catch(function(error) { next(error) });
};


// GET /quizes/:quizId/comments/new
exports.new = function(req, res) {
	res.render('comments/new.ejs', {
		quizid: req.params.quizId,
		quizpregunta: req.quiz.pregunta,
		errors: []
	});
};


// POST /quizes/:quizId/comments
exports.create = function(req, res) {
	var comment = models.Comment.build(	{
		texto:	req.body.comment.texto,
		QuizId:	req.params.quizId		// Crear objeto comment
	} );

	comment.validate().then(function(err) {
		if (err) {
			res.render('comments/new.ejs', {
				comment: comment,
				quizid: req.params.quizId,
				quizpregunta: req.quiz.pregunta,
				errors: err.errors
			} );
		} else {
			// save: guarda en DB campo texto de comment
			comment.save().then( function() {
				// res.redirect: Redirección HTTP a lista de preguntas:
				res.redirect('/quizes/' + req.params.quizId)
			} ) 
		}
	} ).catch(function(error) { next(error) });
};


// GET /quizes/:quizId/comments/:commentId/publish
exports.publish = function(req, res) {
	req.comment.publicado = true;
	req.comment.save( {fields: ["publicado"]} ).then(function() {
		res.redirect('/quizes/' + req.params.quizId);
	} ).catch(function(error) { next(error) });
};


// DELETE /quizes/:quizId/comments/:commentId
exports.destroy = function(req, res) {
	req.comment.destroy().then(function() {
		res.redirect('/quizes/' + req.params.quizId);
	} ).catch( function(error){ next(error) });
};


// GET /quizes/:quizId/comments/:commentId/edit
exports.edit = function(req, res) {
	var comment = req.comment;
	var quiz = req.quiz;
	res.render('comments/edit', {
		comment: comment,
		quiz: quiz,
		errors: []
	} );
};


// PUT /quizes/:quizId/comments/:commentId/update
exports.update = function(req, res) {
	req.comment.texto = req.body.comment.texto;
	req.comment.save( {fields: ["texto"]} ).then(function() {
		res.redirect('/quizes/' + req.params.quizId);
	} ).catch(function(error){ next(error) });
}; 
