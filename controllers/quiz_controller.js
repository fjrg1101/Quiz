var models = require('../models/models.js');

// Autoload :id
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else {
				next(new Error('No existe quizId=' + quizId))
			}
		}
	).catch(function(error) { next(error); });
};


// GET /quizes
exports.index = function(req, res) {
//	models.Quiz.findAll().then(function(quizes) {
	var search = req.query.search?"%" + req.query.search.replace(/ /g,'%') + "%":"%";
	models.Quiz.findAll({where:["pregunta LIKE ?", search]}).then(function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
	}).catch(function(error) { next(error); });
};


// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(		//crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);
	res.render('quizes/new', { quiz: quiz, errors: [] });
};


// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: [] });
};


// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer', { 	quiz: req.quiz,
									respuesta: resultado,
									errors: []
								}
			);
}; 


// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );
	quiz.validate().then(function(err){
		if (err) {
			res.render('quizes/new', {quiz: quiz, errors: err.errors});
		} else {
			// save: guarda en DB campos pregunta y respuesta de quiz
			quiz.save({fields: ["pregunta", "respuesta"]})
				.then( function(){res.redirect('/quizes')} ) 
		}	// res.redirect: Redirección HTTP (URL relativo) a lista de preguntas
	});
}; 


/**********************************************************************************************************
// Solución aportada en el foro, válida para la versión de Sequelize@1.7.0   -sin comprobar
// ( El desarrollo inicial funciona instalando Sequelize@2.0.0 [deprecated]  -comprobado y en uso )

// POST /quizes/create
exports.create = function(req, res){
	var quiz = models.Quiz.build( req.body.quiz );
	var errors = quiz.validate(); // Ya que el objeto errors no tiene .then()
	if (errors) {
		var i=0;
		var errores=new Array(); // Se convierte en [] con la propiedad message por compatibilidad con layout
		for (var prop in errors) 
			errores[i++]={message: errors[prop]};        
		res.render('quizes/new', {quiz: quiz, errors: errores});
	} else {
		// save: guarda en DB campos pregunta y respuesta de quiz
		quiz.save({fields: ["pregunta", "respuesta"]}).then( function(){ res.redirect('/quizes') }) ;
	}
};
************************************************************************************************************/