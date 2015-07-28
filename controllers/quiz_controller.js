var models = require('../models/models.js');

// Autoload :id
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else {
				next(new Error('No existe quizId= ' + quizId))
			}
		}
	).catch(function(error) { next(error); });
};


// GET /quizes
exports.index = function(req, res) {
	var buscar = req.query.search?"%" + req.query.search.replace(/ /g,'%') + "%":"%";
	var ambito = req.query.tema?req.query.tema:"%";
	models.Quiz.findAll({where: {	pregunta:	{ $like: buscar },
									tema:		{ $like: ambito } 
								}
						}).then(function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
	}).catch(function(error) { next(error); });
};


// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: [] });
};			// req.quiz: instancia de quiz cargada con autoload


// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer', { 	quiz: req.quiz,
									respuesta: resultado,
									errors: []
	});
}; 


// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(		//crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema"}
	);
	res.render('quizes/new', { quiz: quiz, errors: [] });
};


// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );
	quiz.validate().then(function(err){
		if (err) {
			res.render('quizes/new', {quiz: quiz, errors: err.errors});
		} else {
			// save: guarda en DB campos pregunta, respuesta y tema de quiz
			quiz.save({fields: ["pregunta", "respuesta", "tema"]})
				.then( function(){res.redirect('/quizes')} ) 
		}	// res.redirect: Redirección HTTP (URL relativo) a lista de preguntas
	}).catch(function(error){ next(error) });
}; 

/**********************************************************************************************************
// Solución aportada en el foro, válida para la versión de sequelize@1.7.0	-sin comprobar
// ( El desarrollo inicial funciona instalando sequelize@2.0.0-rc4			-comprobado )

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


// GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz
	res.render('quizes/edit', {quiz: quiz, errors: []});
};


// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta  = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema      = req.body.quiz.tema;

	req.quiz.validate().then(function(err){
		if (err) {
			res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
		} else {
			// save: guarda campos pregunta y respuesta en DB
			req.quiz.save( {fields: ["pregunta", "respuesta", "tema"]} )
					.then( function(){ res.redirect('/quizes'); } );
		}	// Redirección HTTP a lista de preguntas (URL relativo)
	}).catch(function(error){ next(error) });
};


// DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function(error){ next(error) });
};


//  console.log("req.quiz.id: " + req.quiz.id); 
