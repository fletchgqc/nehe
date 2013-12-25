var app = require('./index.js');

app.get('/details', function(page, model, params, next) {
  console.log('on events details page');
  console.log(params.query);
  
  var year = params.query.year;
  model.set('_page.year', year);
  var season = model.at('seasons.' + params.query.seasonId);
  // var eventQuery = model.query('events', [{seasonId:params.query.seasonId, year:year}, {}, {limit: 1}]);
  var eventQuery = model.query('events', {seasonId:params.query.seasonId, year:year, location:'None'});

  model.subscribe(season, eventQuery, function(err) {
    console.log('subscribed');
    if (err) return next(err);
    if (!season.get()) return next();

    model.ref('_page.season', season);  
    eventQuery.ref('_page.event');
    return page.render('events/details');
  });
});

app.view.fn('createAnswerSelect', function(input) {
    var options = input.split('\n');
    var optionsHtml = '';
    for (var i = 0; i < options.length; i++) {
        optionsHtml += '<option>' + options[i] + '</option>';
    }
    console.log(input.split('\n'));
    return optionsHtml;
});

app.saveDetail = function() {
  var model = this.model;
  var event = model.at('_page.event');

  model.fetch(event, function() {
    var seasonId = event.get('seasonId');

    //event.setNull('details', []);
    var question = model.get('_page.detail.question');
    console.log('Q:' + question);
    var answerBox = model.get('_page.detail.answers');
    console.log('AB:' + answerBox);
    var answers = answerBox.split('\n');
    console.log('A:' + answers);

    event.details.add({question:question, answers:answers}, function() {
      model.del('_page.detail.question');
      model.del('_page.detail.answers');
    });
  });
}