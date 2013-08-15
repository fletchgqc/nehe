var app = require('derby').createApp(module)

app
  .use(require('derby-ui-boot'))
  .use(require('../../ui'))

app.get('/', function(page, model) {
  page.render('home', {
    agNames: ['Valencia', 'Lyon'],
    years: ['2013', '2014'],
    seasons: ['Easter']
  })
})

app.get('/registrations/ag', function(page, model, params, next) {
  var agName = params.query.agName,
    year = params.query.year,
    season = params.query.season;

  var registrationQuery = model.query('registration', { 
    agName:agName, year:year, season:season
  });
  var registration = model.at('_page.registration');
  registration.set('agName', agName);
  registration.set('year', year);
  registration.set('season', season);
  registrationQuery.subscribe(function(err) {
    if (err) return next(err)
    registrationQuery.ref('_page.registrations');
    page.render('registrations', {
      agName: agName,
      year: year,
      season: season
    })
  })
})

app.get('/registrations/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('edit')
  }
  var registration = model.at('registration.' + params.id)
  model.subscribe(registration, function(err) {
    if (err) return next(err)
    if (!registration.get()) return next()
    model.ref('_page.registration', registration)
    page.render('edit')
  })
})

app.gotoRegistration = function() {
  var model = this.model;
  var registration = model.at('_page.registration');
  app.history.push('/registrations/ag?agName=' + registration.get('agName') + 
    '&year=' + registration.get('year') + '&season=' + registration.get('season'));
}

app.done = function() {
  var model = this.model;
  var registration = model.at('_page.registration')
  if (!registration.get('name')) {
    var checkName = registration.on('change', 'name', function(value) {
      if (!value) return
      model.del('_page.nameError')
      model.removeListener('change', checkName)
    })
    model.set('_page.nameError', true)
    document.getElementById('name').focus()
    return
  }

  if (!registration.get('id')) {
    model.add('registration', registration.get())
  }
  app.history.push('/registrations/ag?agName=' + registration.get('agName') + 
    '&year=' + registration.get('year') + '&season=' + registration.get('season'));
}

app.cancel = function() {
  app.history.back()
}

app.deleteRegistration = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('_page.registration')
  app.history.back()
}
