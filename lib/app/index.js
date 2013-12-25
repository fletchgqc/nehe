var app = require('derby').createApp(module);
require('./events.js');

app.use(require('../../ui'));

app.get('/', function(page, model) {
  var seasonQuery = model.query('seasons', {});
  seasonQuery.subscribe(function(err) {
    if (err) return next(err)
    seasonQuery.ref('_page.seasons');

    var agQuery = model.query('ags', {});
      agQuery.subscribe(function(err) {
      if (err) return next(err);
      agQuery.ref('_page.ags');
      return page.render('home', {
         years: ['2013', '2014']
      });
    });
  });
});

app.get('/admin', function(page, model, params, next) {
  //var seasons = model.at('seasons');
  var seasonQuery = model.query('seasons', {});
  //model.subscribe(seasons, function(err) {
  seasonQuery.subscribe(function(err) {
    if (err) return next(err)
   // model.ref('_page.seasons', seasonQuery);
    seasonQuery.ref('_page.seasons');
    //return page.render('admin');
    return page.render('admin', {
       years: ['2013', '2014']
    });
  });
});

/*
 * Area CRUD
 */
app.get('/areas', function (page, model, params, next) {
  var areaQuery = model.query('areas', {});
  areaQuery.subscribe(function(err) {
    if (err) return next(err);
    areaQuery.ref('_page.areas');
    return page.render('areas/list');
  });
});

app.get('/areas/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('areas/edit');
  }
  var area = model.at('areas.' + params.id)
  model.subscribe(area, function(err) {
    if (err) return next(err);
    if (!area.get()) return next();
    model.ref('_page.area', area);
    page.render('areas/edit');
  });
});

app.saveArea = function() {
  var model = this.model;
  var area = model.at('_page.area')

  if (!area.get('id')) {
    console.log(model.add('areas', area.get()));
  }

  app.history.push('/areas')
}

app.deleteArea = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('_page.area');
  app.history.back()
}

/*
 * AG CRUD
 */
app.get('/ags', function (page, model, params, next) {
  var agQuery = model.query('ags', {});
  agQuery.subscribe(function(err) {
    if (err) return next(err);
    agQuery.ref('_page.ags');
    return page.render('ags/list');
  });
});

app.get('/ags/:id', function(page, model, params, next) {
  var areaQuery = model.query('areas', {});
  areaQuery.subscribe(function (err) {
    areaQuery.ref('_page.areas');

    if (params.id === 'new') {
      return page.render('ags/edit');
    }

    var ag = model.at('ags.' + params.id)
    model.subscribe(ag, function(err) {
      if (err) return next(err);
      if (!ag.get()) return next();
      model.ref('_page.ag', ag);
      page.render('ags/edit');
    });
  });
});

app.saveAg = function() {
  var model = this.model;
  var ag = model.at('_page.ag')
  //var area = 

  if (!ag.get('id')) {
    console.log(model.add('ags', ag.get()));
  }

  app.history.push('/ags')
}

app.deleteAg = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('_page.ag');
  app.history.back()
}

/*
 * Season CRUD
 */
app.get('/seasons', function (page, model, params, next) {
  var seasonQuery = model.query('seasons', {});
  seasonQuery.subscribe(function(err) {
    if (err) return next(err);
    seasonQuery.ref('_page.seasons');
    return page.render('seasons/list');
  });
});

app.get('/seasons/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('seasons/edit');
  }
  var season = model.at('seasons.' + params.id)
  model.subscribe(season, function(err) {
    if (err) return next(err);
    if (!season.get()) return next();
    model.ref('_page.season', season);
    page.render('seasons/edit');
  });
});

app.saveSeason = function() {
  var model = this.model;
  var season = model.at('_page.season')

  if (!season.get('id')) {
    console.log(model.add('seasons', season.get()));
  }

  app.history.push('/seasons')
}

app.deleteSeason = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('_page.season');
  app.history.back()
}

/*
 * Event CRUD
 */
app.get('/events', function (page, model, params, next) {
  console.log(params.query);
  
  var year = params.query.year;
  model.set('_page.year', year);
  var season = model.at('seasons.' + params.query.seasonId);

  model.subscribe(season, function(err) {
    if (err) return next(err);
    if (!season.get()) return next();
    model.ref('_page.season', season);  

    var eventQuery = model.query('events', {seasonId:params.query.seasonId, year:year});
    eventQuery.subscribe(function(err) {
      if (err) return next(err);
      eventQuery.ref('_page.events');
      return page.render('events/list');
    });
  });
});

app.get('/events/:id', function(page, model, params, next) {
  var seasonQuery = model.query('seasons', {});

  seasonQuery.subscribe(function (err) {
    seasonQuery.ref('_page.seasons');

    model.set('_page.years', ['2013', '2014']);


    if (params.id === 'new') {
      model.set('_page.event.year', params.query.year);
      model.set('_page.event.seasonId', params.query.seasonId);
      return page.render('events/edit');
    }

    var event = model.at('events.' + params.id)
    model.subscribe(event, function(err) {
      if (err) return next(err);
      if (!event.get()) return next();
      model.ref('_page.event', event);
      page.render('events/edit');
    });
  });
});

app.saveEvent = function() {
  var model = this.model;
  var event = model.at('_page.event');
  var seasonId = event.get('seasonId');
  var year = event.get('year');

  var otherEventQuery = model.query('events', {
    seasonId: seasonId,
    year: year
  });
  otherEventQuery.fetch(function (err) {
    if (otherEventQuery.get().length == 0) {
      console.log('No events exist yet, creating a "None" event option first.');
      model.add('events', {
        location:'None',
        seasonId:seasonId,
        year:year
      });
    }
  
    if (!event.get('id')) {
      event.get('seasonId') + '&year=' + event.get('year')
      model.add('events', event.get());
    }

    app.history.push('/events?seasonId=' + seasonId + '&year=' + year);
  });
}

app.deleteEvent = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('_page.event');
  app.history.back()
}

/*
 * Registrations
 */
 app.get('/registrations/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('edit')
  }
  var registration = model.at('registrations.' + params.id)
  model.subscribe(registration, function(err) {
    if (err) return next(err)
    if (!registration.get()) return next()
    model.ref('_page.registration', registration)
    page.render('edit')
  })
})

app.get('/registrations/ag', function(page, model, params, next) {
  var agId = params.query.agId,
    year = params.query.year,
    seasonId = params.query.seasonId;

  var ag = model.at('ags.' + agId);
  var season = model.at('seasons.' + seasonId);

  model.set('_page.genders', [
    'Male',
    'Female'
  ]);

  model.fetch(ag, season, function(err) {
    model.ref('_page.season', season);
    model.ref('_page.ag', ag);

    var eventQuery = model.query('events', {
      seasonId:seasonId, year:year
    });

    model.subscribe(eventQuery, function(err) {
      if (err) console.log('An error.');
      console.log(err);

      eventQuery.ref('_page.events');
      var eventCount = model.get('_page.events').length;

      if (eventCount > 0) {
        var eventIds = [];
        for (var i = 0; i < model.get('_page.events').length; i++) {
          eventIds.push(model.get('_page.events.' + i).id);
        }
        console.log(eventIds);

        var registrationQuery = model.query('registrations', {
          eventId: { '$in': eventIds }
        });

        var registration = model.at('_page.registration');
        registration.set('agId', agId);
        registration.set('gender', model.get('_page.genders.0'));
      
        model.subscribe(registrationQuery, function(err) {
          if (err) return next(err)
          registrationQuery.ref('_page.registrations');
          registration.set('eventId', model.get('_page.events.0').id);
          
          page.render('registrations', {
            ag: ag.get(),
            year: year,
            season: season.get()
          });
        });
      } else {
        page.render('registrations', {
          ag: ag.get(),
          year: year,
          season: season.get()
        });
      }
    });
  });
});

app.get('/registrations/eventshow', function(page, model, params, next) {
  var areas = model.at('areas');

  var agName = params.query.agName,
    year = params.query.year,
    season = params.query.season;

  var registrationQuery = model.query('registrations', { 
    agName:agName, year:year, season:season
  });
  var registration = model.at('_page.registration');
  registration.set('agName', agName);
  registration.set('year', year);
  registration.set('season', season);
  registrationQuery.subscribe(areas, function(err) {
    if (err) return next(err)
    registrationQuery.ref('_page.registrations');
    page.render('registrations', {
      agName: agName,
      year: year,
      season: season
    })
  })
});

function getById (collection, id) {
  console.log('Calling getById, id: ' + id);
  //console.log(collection);
  for (var i = 0; i < collection.length; i++) {
    if (id === collection[i].id) {
      return collection[i];
    }
  }
}

app.view.fn('getById',getById);

app.view.fn('locationByEventId', function(collection, id) {
  var event = getById(collection, id);
  return event.location;
});

app.gotoRegistration = function() {
  console.log('Go to registration...');
  var model = this.model;
  var registration = model.at('_page.registration');
  app.history.push('/registrations/ag?agName=' + 'agName' + 
    '&year=' + registration.get('year') + '&season=' + registration.get('season'));
}


app.saveRegistration = function() {
  var model = this.model;
  var registration = model.at('_page.registration');
  console.log('Registration to be saved:');
  console.log(registration.get());
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
    model.add('registrations', registration.get(), function() {
      registration.del();
      registration.set('gender', model.get('_page.genders.1'));
      registration.set('eventId', model.get('_page.events.0').id);
    });
  }
  //registration.set('agId', agId);
  //registration.set('year', year);
  //registration.set('seasonId', seasonId);
  //app.history.push('/registrations/ag?agName=' + registration.get('agName') + 
  //  '&year=' + registration.get('year') + '&season=' + registration.get('season'));
}

app.cancel = function() {
  app.history.back()
}

app.deleteRegistration = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('_page.registration')
  app.history.back()
}
