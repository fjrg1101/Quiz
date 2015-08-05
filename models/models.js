var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd, 
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage,  // solo SQLite (.env)
    omitNull: true      // sólo tiene sentido en el entorno de Postgres (en Heroku)
  }      
);

// Importar la definicion de la tabla Quiz
var quiz_path = path.join(__dirname,'quiz');
var Quiz = sequelize.import(quiz_path);

// Importar definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);


// Relación entre las dos tablas  (se usan métodos predefinidos de sequelize)
Comment.belongsTo(Quiz);	// cada comentario pertenece a una sola pregunta
Quiz.hasMany(Comment);		// cada pregunta puede tener muchos comentarios


exports.Quiz 	= Quiz;		// exportar tabla Quiz
exports.Comment = Comment;	// exportar tabla Comment


// sequelize.sync() inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
	// then(..) ejecuta el manejador una vez creada la tabla
	Quiz.count().then(function (count){
		if(count === 0) {   // la tabla se inicializa sólo si está vacía
//			Quiz.bulkCreate( 
//				[ {pregunta: 'Capital de Noruega', respuesta: 'Oslo', tema: 'Otro'},
//				  {pregunta: 'Capital de Suecia',  respuesta: 'Estocolmo', tema: 'Otro'},
//				  {pregunta: 'Capital de Austria', respuesta: 'Viena', tema: 'Otro'}
//				]);
			Quiz.create({ pregunta: 'Capital de Italia',
						  respuesta: 'Roma',
						  tema: 'Otro'
						});
			Quiz.create({ pregunta: 'Pintor de la bóveda de la Capilla Sixtina del Vaticano',
						  respuesta: 'Miguel Angel',
						  tema: 'Humanidades'
						});
			Quiz.create({ pregunta: 'Juego de tablero con peones, caballos, torres, alfiles, dama y rey',
						  respuesta: 'Ajedrez',
						  tema: 'Ocio'
						});
			Quiz.create({ pregunta: 'Partícula del átomo que tiene carga negativa',
						  respuesta: 'Electrón',
						  tema: 'Ciencia'
						});
			Quiz.create({ pregunta: 'Medio de transmisión de pulsos de luz usado en telecomunicaciones',
						  respuesta: 'Fibra óptica',
						  tema: 'Tecnología'
						})
			.then(function(){console.log('Base de datos inicializada')});
		};
	});
});
