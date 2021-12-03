const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const passport = require('passport');
const session = require('express-session');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.set('view-engine','ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

//==================================================================================
// Conexión con la base de datos
const conection = mysql.createConnection({
    host : 'database-1.caujgpylylan.us-east-2.rds.amazonaws.com',
    database : 'telematica',
    user : 'ralagares',
    password : 'comida123456789'
});
//==================================================================================
// Página de inicio/principal
app.get('/', (req,res) => {
    var selector = 'SELECT * FROM Casos;'
    var infectados = 0;
    var muerte = 0;
    var curado = 0;
    var casa = 0;
    var hospital = 0;
    var uci = 0;
    var positivos = 0;
    var negativos = 0;
    conection.query(selector, (error, result) => {
        if (error) throw error;
        for (let k = 0; k < result.length; k++) {
            if (result[k].Estado == 'En tratamiento casa' 
            || result[k].Estado == 'En tratamiento hospital'
            || result[k].Estado == 'En tratamiento UCI') {
                infectados++
                if (result[k].Estado == 'En tratamiento casa') {
                    casa++
                } else if (result[k].Estado == 'En tratamiento hospital') {
                    hospital++
                } else {
                    uci++
                }
            }
            if (result[k].Estado == 'Muerte') {
                muerte++
            }
            if (result[k].Estado == 'Curado') {
                curado++
            }
            if (result[k].Resultado == 'Positivo') {
                positivos++
            } else {
                negativos++
            }
        }
        var selector2 = 'SELECT COUNT(idCaso) AS Cuenta,Examen FROM telematica.Casos GROUP BY Examen ORDER BY Examen ASC;'
        var casos = [];
        conection.query(selector2, (error2, result2) => {
            if (error2) throw error;
            for (let k = 0; k < result2.length; k++) {
                casos.push([result2[k].Cuenta,result2[k].Examen+";"])                        
            }
            var selector3 = 'SELECT COUNT(idCaso) AS Cuenta,Estado, LEFT ( fechaEstado , 15 ) AS Fecha FROM telematica.Casos WHERE Estado = "Muerte" GROUP BY LEFT ( fechaEstado , 15 );'
            var muertes = [];
            conection.query(selector3, (error3, result3) => {
                if (error3) throw error;
                for (let k = 0; k < result3.length; k++) {
                    muertes.push([result3[k].Cuenta,result3[k].Fecha+";"])                        
                }
                console.log(muertes)
                res.render('home.ejs',{
                    errorInicio: "",
                    infectados: infectados,
                    muertes: muerte,
                    curados: curado,
                    casa: casa,
                    hospital: hospital,
                    uci: uci,
                    positivos: positivos,
                    negativos: negativos,
                    casos: casos,
                    muertesDias: muertes
                });
            });
        });
    });
});

// Formulario para ingresar como médico o asistente
app.post('/usuarios', async (req, res) => {
    // Datos del formulario: credenciales de usuario
    const {user,password} = req.body;
    //const hashedPassword = await bcrypt.hash(password, 1);
    // Verificación 
    conection.query('SELECT * FROM usuarios', (error, result) => {
        if (error) throw error;
        //console.log(hashedPassword)
        var u
        var medico
        for (let k = 0; k < result.length; k++) {
            if (user == result[k].User && password == result[k].Password) {
                console.log('okook');
                req.session.username = user;
                errorInicio = ""
                u = true;
                if (result[k].Rol == "medico") {
                    medico = true;
                } else {
                    medico = false;
                }
                break
            } else {
                errorInicio = "Usuario o contraseña incorrectos"
                console.log('oh no');
                u = false;
            }
        }
        if (!u) {
            res.render('home.ejs',{
                errorInicio: errorInicio,
                infectados: "",
                muertes: "",
                curados: "",
                casa: "",
                hospital: "",
                uci: "",
                positivos: "",
                negativos: "",
                casos: "",
                muertesDias: ""
            });
        } else {
            if (medico) {
                res.redirect('/medico-home');
            } else{
                res.redirect('/asistente-home');
            }
        }
    });
});

//==================================================================================
// Página para ingresar como administrador
app.get('/admin-home', (req,res) => {
    res.render('admin-home.ejs');
});

// Formulario de ingreso
app.post('/admin-home', async (req,res) => {
    // Datos del formulario: credenciales de administrador
    const {user,password} = req.body;
    // Verificación 
    conection.query('SELECT * FROM administrador', (error, result) => {
        if (error) throw error;
        if (user == result[0].usuario && password == result[0].contrasena) {
            console.log('nice');
            req.session.loggedin = true;
            req.session.username = user;
            console.log(user)
            res.redirect('/admin-reg')
        } else {
            console.log('oh no');
            res.redirect('/admin-home');
        }
    });
});

// Página principal de administrador
app.get('/admin-reg', (req,res) => {
    console.log(req.session.loggedin)
    var selector = 'SELECT * FROM usuarios;'
    conection.query(selector, (error, result) => {
        if (error) throw error;
        res.render('admin-registrar.ejs',{
            data: result,
            alert: ""
        });
    });
});

// Lista de usuarios registrados
app.post('/admin-lista', (req,res) => {
    var selector = 'SELECT * FROM usuarios;'
    conection.query(selector, (error, result) => {
        if (error) throw error;
        res.render('admin-registrar.ejs',{
            data: result,
            alert: ""
        });
    });
});

// Formulario para registrar un nuevo usuario
app.post('/admin-reg', async (req, res) => {
    try {
        // Contraseña segura
        //const hashedPassword = await bcrypt.hash(req.body.contrasena, 10);
        // Datos del formulario registro
        var users = {
            Nombre: req.body.nombre,
            Apellido: req.body.apellido,
            Cedula: req.body.cedula,
            Rol: req.body.rol,
            User: req.body.usuario,
            Password: req.body.contrasena
        };
        // Insertar datos en la base de datos
        var query = conection.query('INSERT INTO usuarios SET ?', users, function (error, results, fields) {
            if (error) throw error;
            // Neat!
        });
        console.log(query.sql);
        res.redirect('/admin-reg')
    } catch (error) {
        console.log('ups, hubo un problema');
    }
});

// Formulario para buscar usuarios registrados
app.post('/admin-usuarios-reg', async (req, res) => {
    var dataUsuarios
    try {
        var selector;
        if (req.body.filtro == "nombre") {
            selector = `SELECT * FROM usuarios WHERE Nombre = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "usuario"){
            selector = `SELECT * FROM usuarios WHERE User = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "cedula"){
            selector = `SELECT * FROM usuarios WHERE Cedula = \'${req.body.data}\' ;`
        }
        conection.query(selector, (error, result) => {
            if (error) throw error;
            if (result == ""){
                alert = "No hay usuarios registrados con esas características"
            } else {
                alert = ""
            }
            res.render('admin-registrar.ejs',{
                data: result,
                alert: alert
            });
        });
    } catch (error) {
        console.log('error');
    }
});

// LOGOUT ****
app.get('/logout', (req,res) => {
    res.redirect('/')
});

//==================================================================================
// Página principal de asistente
app.get('/asistente-home', (req,res) => {
    var selector = 'SELECT * FROM Casos;'
    conection.query(selector, (error, result) => {
        if (error) throw error;
        res.render('asistente-home.ejs',{
            data: result,
            alert: ""
        });
    });
});

// Formulario para registrar un caso
app.post('/registrar-caso', (req,res) => {
        // Datos del formulario registro
        var users = {
            Nombre: req.body.nombre,
            Apellido: req.body.apellido,
            Cedula: req.body.cedula,
            Sexo: req.body.sexo,
            Nacimiento: req.body.nacimiento,
            Residencia: req.body.residencia,
            Trabajo: req.body.trabajo,
            Resultado: req.body.resultado,
            Examen: req.body.examen,
            Estado: req.body.estado,
            fechaEstado: Date()
        };

        // Insertar datos en la base de datos
        var query = conection.query('INSERT INTO Casos SET ?', users, function (error, results, fields) {
            if (error) throw error;
            console.log(results.insertId)
            var nuevoEstado = {
                idCaso: results.insertId,
                Estado: req.body.estado,
                fechaEstado: Date()
            };
            var query2 = conection.query('INSERT INTO Estados SET ?', nuevoEstado, function (error, results2, fields) {
                if (error) throw error;
            });
        });
        console.log(query.sql);
        res.redirect('/asistente-home')
});

//  Página para gestionar los casos
app.post('/asistente-gestion', (req,res) => {
    var selector = 'SELECT * FROM Casos;'
    var selectorEstado = `SELECT * FROM Estados WHERE idCaso = \'${req.body.id}\' ;`
    conection.query(selector, (error, result) => {
        if (error) throw error;
        console.log(req.body.id)
        for (let i = 0; i < result.length; i++) {
            if (req.body.id == result[i].idCaso) {    
                conection.query(selectorEstado, (error2,result2) => {
                    if (error2) throw error;
                    res.render('asistente-gestion.ejs',{
                        data: result,
                        info: result[i],
                        alert: "",
                        estados: result2
                    });
                    console.log(result2)
                });
            }            
        }
    });
});

// Formulario para buscar casos registrados - render REGISTRAR
app.post('/buscar-casos', (req,res) =>{
    var dataUsuarios
    try {
        var selector;
        if (req.body.filtro == "nombre") {
            selector = `SELECT * FROM Casos WHERE Nombre = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "id"){
            selector = `SELECT * FROM Casos WHERE idCaso = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "cedula"){
            selector = `SELECT * FROM Casos WHERE Cedula = \'${req.body.data}\' ;`
        }
        conection.query(selector, (error, result) => {
            if (error) throw error;
            if (result == ""){
                alert = "No hay pacientes registrados con esas características"
            } else {
                alert = ""
            }
            res.render('asistente-home.ejs',{
                data: result,
                alert: alert
            });
        });
    } catch (error) {
        console.log('error');
    }
});

// Formulario para buscar casos registrados - render GESTIONAR
app.post('/buscar-casos-g', (req,res) =>{
    var dataUsuarios
    try {
        var selector;
        if (req.body.filtro == "nombre") {
            selector = `SELECT * FROM Casos WHERE Nombre = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "id"){
            selector = `SELECT * FROM Casos WHERE idCaso = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "cedula"){
            selector = `SELECT * FROM Casos WHERE Cedula = \'${req.body.data}\' ;`
        }
        conection.query(selector, (error, result) => {
            if (error) throw error;
            if (result == ""){
                alert = "No hay pacientes registrados con esas características"
            } else {
                alert = ""
            }
            res.render('asistente-gestion.ejs',{
                data: result,
                info: "",
                alert: alert,
                estados: result
            });
        });
    } catch (error) {
        console.log('error');
    }
});

// Lista de casos registrados - render REGISTRAR
app.post('/lista', (req,res) => {
    var selector = 'SELECT * FROM Casos;'
    conection.query(selector, (error, result) => {
        if (error) throw error;
        res.render('asistente-home.ejs',{
            data: result,
            alert: ""
        });
    });
});

// Lista de casos registrados - render GESTIONAR
app.post('/lista-g', (req,res) => {
    var selector = 'SELECT * FROM Casos;'
    conection.query(selector, (error, result) => {
        if (error) throw error;
        res.render('asistente-gestion.ejs',{
            data: result,
            info: "",
            alert: ""
        });
    });
});

// Formulario para actualizar
app.post('/actualizar-info', (req,res) => {
    var selector = `UPDATE Casos SET ? WHERE idCaso = \'${req.body.id}\' ;`
    var paciente = {
        Nombre: req.body.nombre,
        Apellido: req.body.apellido,
        Cedula: req.body.cedula,
        Sexo: req.body.sexo,
        Nacimiento: req.body.nacimiento,
        Residencia: req.body.residencia,
        Trabajo: req.body.trabajo,
        Resultado: req.body.resultado,
        Examen: req.body.examen,
        Estado: req.body.estado,
        fechaEstado: Date()
    };
    var selector2 = `INSERT INTO Estados SET ? ;`
    var nuevoEstado = {
        idCaso: req.body.id,
        Estado: req.body.estado,
        fechaEstado: Date()
    }
    // Actualizar la información de un paciente
    var query = conection.query(selector, paciente, function (error, results, fields) {
        if (error) throw error;
        // Insertar nuevo estado
        var query2 = conection.query(selector2, nuevoEstado, function (error, results, fields) {
            if (error) throw error;
        });
        console.log(query2.sql);
    });
    res.redirect('/asistente-home')
});

//==================================================================================
// Página principal de médico
app.get('/medico-home', (req,res) => {
    var selector = 'SELECT * FROM Casos;'
    var casosNegativos = [];
    var casosTratamiento = [];
    var casosUCI = [];
    var casosCuradosPositivos = [];
    var casosMuerte = [];
    conection.query(selector, (error, result) => {
        if (error) throw error;
        for (let k = 0; k < result.length; k++) {
            if (result[k].Resultado == 'Negativo') {
                casosNegativos.push(result[k].Residencia+";")
            }
            if (result[k].Estado == 'En tratamiento casa' 
                || result[k].Estado == 'En tratamiento hospital') {
                casosTratamiento.push(result[k].Residencia+";");
            }
            if (result[k].Estado == "En tratamiento UCI") {
                casosUCI.push(result[k].Residencia+";");
            }
            if (result[k].Estado == "Curado" && result[k].Resultado == 'Positivo') {
                casosCuradosPositivos.push(result[k].Residencia+";");
            }
            if (result[k].Estado == "Muerte") {
                casosMuerte.push(result[k].Residencia+";");
            }
        }
        
        res.render('medico-home.ejs',{
            data: result,
            alert: "",
            casosN: casosNegativos,
            casosT: casosTratamiento,
            casosU: casosUCI,
            casosC: casosCuradosPositivos,
            casosM: casosMuerte
        });
    });
});

// Lista de casos registrados
app.post('/lista-m', (req,res) => {
    var selector = 'SELECT * FROM Casos;'
    var casosNegativos = [];
    var casosTratamiento = [];
    var casosUCI = [];
    var casosCuradosPositivos = [];
    var casosMuerte = [];
    conection.query(selector, (error, result) => {
        if (error) throw error;
        for (let k = 0; k < result.length; k++) {
            if (result[k].Resultado == 'Negativo') {
                casosNegativos.push(result[k].Residencia+";")
            }
            if (result[k].Estado == 'En tratamiento casa' 
                || result[k].Estado == 'En tratamiento hospital') {
                casosTratamiento.push(result[k].Residencia+";");
            }
            if (result[k].Estado == "En tratamiento UCI") {
                casosUCI.push(result[k].Residencia+";");
            }
            if (result[k].Estado == "Curado" && result[k].Resultado == 'Positivo') {
                casosCuradosPositivos.push(result[k].Residencia+";");
            }
            if (result[k].Estado == "Muerte") {
                casosMuerte.push(result[k].Residencia+";");
            }
        }
        
        res.render('medico-home.ejs',{
            data: result,
            alert: "",
            casosN: casosNegativos,
            casosT: casosTratamiento,
            casosU: casosUCI,
            casosC: casosCuradosPositivos,
            casosM: casosMuerte
        });
    });
});

// Formulario para buscar casos registrados
app.post('/buscar-casos-m', (req,res) =>{
    var dataUsuarios
    try {
        var selector;
        if (req.body.filtro == "nombre") {
            selector = `SELECT * FROM Casos WHERE Nombre = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "id"){
            selector = `SELECT * FROM Casos WHERE idCaso = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "cedula"){
            selector = `SELECT * FROM Casos WHERE Cedula = \'${req.body.data}\' ;`
        }
        conection.query(selector, (error, result) => {
            if (error) throw error;
            if (result == ""){
                alert = "No hay pacientes registrados con esas características"
            } else {
                alert = ""
            }
            res.render('medico-home.ejs',{
                data: result,
                alert: "",
                casosN: "",
                casosT: "",
                casosU: "",
                casosC: "",
                casosM: ""
            })
        });
    } catch (error) {
        console.log('error');
    }
});

//  Página para revisar los casos
app.post('/medico-revision', (req,res) => {
    var selector = 'SELECT * FROM Casos;'
    var selectorEstado = `SELECT * FROM Estados WHERE idCaso = \'${req.body.id}\' ;`
    conection.query(selector, (error, result) => {
        if (error) throw error;
        console.log(req.body.id)
        for (let i = 0; i < result.length; i++) {
            if (req.body.id == result[i].idCaso) {    
                conection.query(selectorEstado, (error2,result2) => {
                    if (error2) throw error;
                    res.render('medico-pacientes.ejs',{
                        data: result,
                        info: result[i],
                        alert: "",
                        estados: result2
                    });
                    console.log(result2)
                });
            }            
        }
    });
});

// Información de los casos
app.get('/medico-pacientes', (req,res) => {
    res.render('medico-pacientes.ejs');
});

// Formulario para buscar casos registrados
app.post('/buscar-casos-m-r', (req,res) =>{
    var dataUsuarios
    try {
        var selector;
        if (req.body.filtro == "nombre") {
            selector = `SELECT * FROM Casos WHERE Nombre = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "id"){
            selector = `SELECT * FROM Casos WHERE idCaso = \'${req.body.data}\' ;`
        }
        else if (req.body.filtro == "cedula"){
            selector = `SELECT * FROM Casos WHERE Cedula = \'${req.body.data}\' ;`
        }
        conection.query(selector, (error, result) => {
            if (error) throw error;
            if (result == ""){
                alert = "No hay pacientes registrados con esas características"
            } else {
                alert = ""
            }
            res.render('medico-pacientes.ejs',{
                data: result,
                alert: alert,
                info: ""
            });
        });
    } catch (error) {
        console.log('error');
    }
});


app.listen(8080, () => {
    console.log('servidor a su servicio en el puerto', 8080)
})  