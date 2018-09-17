const express 		= require('express');
const app			= express();
const bodyParser	= require('body-parser');
const moment 		= require('moment');
const TVDB 			= require('node-tvdb');
const tvdb 			= new TVDB('YOUR_API_KEY');
const mongoose 		= require('mongoose');
const passport 		= require('passport');
const LocalStrategy = require('passport-local');
const User 			= require('./models/user');

mongoose.connect('YOUR_DATABASE');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.searchQuery = req.query.search;
	next();
});

//PASSPORT CONFIG
app.use(require('express-session')({
	secret: "Secret here",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=========================
//ROUTES - GETTING STARTED
//=========================
app.get('/help', (req, res) => {
	let errorMsg = '';
	res.render('help', {currentUser: req.user, error: errorMsg});
});

//================================
//ROUTES - HOME PAGE/NEXT EPISODES
//================================
app.get('/', isLoggedIn, (req, res) => {
	let seriesEps = [];
	let nextEps = [];
	if(req.user.series.length === 0){
		let errorMsg = 'No episodes available';
		res.render('help', {currentUser: req.user, error: errorMsg})
	} else {
		for(let i = 0; i < req.user.series.length; i++){
			tvdb.getSeriesAllById(req.user.series[i]).then(response => {
				seriesEps.push(response);
			})
			.then(result => {
				let episodes = [];
				if(seriesEps.length === req.user.series.length){
					for(let i = 0; i < seriesEps.length; i++){
						if(seriesEps[i].status === 'Continuing'){
							for(let j = 0; j < seriesEps[i].episodes.length; j++){
								episodes.push(
									{
										seriesName: seriesEps[i].seriesName,
										network: seriesEps[i].network,
										airsDayOfWeek: seriesEps[i].airsDayOfWeek,
										airsTime: seriesEps[i].airsTime,
										banner: seriesEps[i].banner,
										seriesId: seriesEps[i].episodes[j].seriesId,
										episodeName: seriesEps[i].episodes[j].episodeName, 
										airedSeason: seriesEps[i].episodes[j].airedSeason,
										airedEpisodeNumber: seriesEps[i].episodes[j].airedEpisodeNumber, 
										firstAired: seriesEps[i].episodes[j].firstAired, 
										overview: seriesEps[i].episodes[j].overview, 
										filename: seriesEps[i].episodes[j].filename
									});
							}
						}
					}
					for(let i = 0; i < episodes.length; i++){
						let given = moment(episodes[i].firstAired, 'YYYY-MM-DD');
						let current = moment().startOf('day');
						let numOfDays = Math.round(moment.duration(given.diff(current)).asDays());
						if(numOfDays > 0){
							nextEps.push(
								{
									seriesName: episodes[i].seriesName, 
									network: episodes[i].network,
									airsDayOfWeek: episodes[i].airsDayOfWeek,
									airsTime: episodes[i].airsTime,							
									banner: episodes[i].banner, 
									seriesId: episodes[i].seriesId,
									episodeName: episodes[i].episodeName, 
									airedSeason: episodes[i].airedSeason,
									airedEpisodeNumber: episodes[i].airedEpisodeNumber,
									firstAired: episodes[i].firstAired, 
									overview: episodes[i].overview, 
									filename: episodes[i].filename, 
									days: numOfDays
								})
						}
					}
					res.render('index', {currentUser: req.user, data: nextEps.sort((a, b) => a.days-b.days)});
				}
			})
			.catch(error => {
				console.log(error);
			});
		}
	}
});

//========================
//ROUTES - RECENT EPISODES
//========================
app.get('/recent', isLoggedIn, (req, res) => {
	let seriesEps = [];
	let nextEps = [];
	if(req.user.series.length === 0){
		let errorMsg = 'No episodes available';
		res.render('help', {currentUser: req.user, error: errorMsg})
	} else {
		for(let i = 0; i < req.user.series.length; i++){
			tvdb.getSeriesAllById(req.user.series[i]).then(response => {
				seriesEps.push(response);
			})
			.then(result => {
				let episodes = [];
				if(seriesEps.length === req.user.series.length){
					for(let i = 0; i < seriesEps.length; i++){
						if(seriesEps[i].status === 'Continuing'){
							for(let j = 0; j < seriesEps[i].episodes.length; j++){
								episodes.push(
									{
										seriesName: seriesEps[i].seriesName,
										network: seriesEps[i].network,
										airsDayOfWeek: seriesEps[i].airsDayOfWeek,
										airsTime: seriesEps[i].airsTime,
										banner: seriesEps[i].banner,
										seriesId: seriesEps[i].episodes[j].seriesId,
										episodeName: seriesEps[i].episodes[j].episodeName,
										airedSeason: seriesEps[i].episodes[j].airedSeason,
										airedEpisodeNumber: seriesEps[i].episodes[j].airedEpisodeNumber, 
										firstAired: seriesEps[i].episodes[j].firstAired, 
										overview: seriesEps[i].episodes[j].overview, 
										filename: seriesEps[i].episodes[j].filename
									});
							}
						}
					}
					for(let i = 0; i < episodes.length; i++){
						let given = moment(episodes[i].firstAired, 'YYYY-MM-DD');
						let current = moment().startOf('day');
						let numOfDays = Math.round(moment.duration(given.diff(current)).asDays());
						if(numOfDays < 0){
							nextEps.push(
								{
									seriesName: episodes[i].seriesName, 
									network: episodes[i].network,
									airsDayOfWeek: episodes[i].airsDayOfWeek,
									airsTime: episodes[i].airsTime,	
									banner: episodes[i].banner, 
									seriesId: episodes[i].seriesId,
									episodeName: episodes[i].episodeName, 
									airedSeason: episodes[i].airedSeason,
									airedEpisodeNumber: episodes[i].airedEpisodeNumber,
									firstAired: episodes[i].firstAired, 
									overview: episodes[i].overview, 
									filename: episodes[i].filename, 
									days: numOfDays
								})
						}
					}
					res.render('recent', {currentUser: req.user, data: nextEps.sort((a, b) => b.days-a.days)});
				}
			})
			.catch(error => {
				console.log(error);
			});
		}
	}
});

//============================
//ROUTES - SEARCH PAGE RESULTS
//============================
app.get('/results', (req, res) => {
	let resArr = [];
	tvdb.getSeriesByName(req.query.search).then(response => {
		res.render('results', {currentUser: req.user, data: response}) 
		resArr.push(response);
	})
	.catch(error => {
		res.render('results', {currentUser: req.user, error: error, data: resArr})
	});
});

//==================
//ROUTES - ADD SHOW
//==================
app.post('/results', isLoggedIn, (req, res) => {
	let userId = req.user._id;
	let queryId = req.body.seriesId;
	User.findByIdAndUpdate(userId, {$push: {series: queryId}}, (err,user) => {});
	res.redirect('back');
});

//====================
//ROUTES - SERIES INFO
//====================
app.get('/series/:id', (req, res) => {
	tvdb.getSeriesAllById(req.params.id).then(response => {
	    tvdb.getEpisodesSummaryBySeriesId(req.params.id).then(seasonResponse => {
	        res.render('series', {currentUser: req.user, data: response, season: seasonResponse.airedSeasons.sort((a,b) => a-b)});
        })
    })
    .catch(error => { 
    	console.log(error);
    });
});

//====================
//ROUTES - USER SHOWS
//====================
app.get('/shows', isLoggedIn, (req, res) => {
	let myShows = [];
	if(req.user.series.length === 0){
		let errorMsg = 'No shows available';
		res.render('help', {currentUser: req.user, error: errorMsg});
	} else {
		for(let i = 0; i < req.user.series.length; i++){
			tvdb.getSeriesById(req.user.series[i]).then(response => {
				myShows.push(response);
			})
			.then(result => {
				if(myShows.length === req.user.series.length){
					res.render('shows', {currentUser: req.user, data: myShows});
				}
			})
			.catch(error => {
				console.log(error);
			})
		}
	}
});

//================
//REMOVE USER SHOW
//================
app.post('/shows', isLoggedIn, (req, res) => {
	let userId = req.user._id;
	let queryId = req.body.seriesId;
	User.findByIdAndUpdate(userId, {$pull: {series: queryId}}, (err,user) => {});
	res.redirect('back');
});

//=======================
//ROUTES - REGISTER PAGE
//=======================
app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	const newUser = User({username: req.body.username});
	User.register(newUser, req.body.password, (err, user) => {
		if(err){
			return res.render('register')
		}
		passport.authenticate('local')(req, res, () => {
			res.redirect('/help');
		})
	});
});

//===========================
//ROUTES - LOGIN/LOGOUT PAGE
//===========================
app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

//=======================
//LOGIN/AUTHENTICATE USER
//=======================
app.post('/login', passport.authenticate('local', 
	{
		successRedirect: '/',
		failureRedirect: 'login'
	}), (req,res) => {
});

//================
//LOGIN MIDDLEWARE
//================
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

app.listen(process.env.PORT || 3000, () => {
	console.log('Server has started');
});