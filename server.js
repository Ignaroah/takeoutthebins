var restify = require('restify');
var builder = require('botbuilder');
require('dotenv').config();
var CronJob = require('cron').CronJob;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
  console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users
server.post('/api/messages', connector.listen());
let isCron = false;
let address = '';

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function(session) {
  try {
    if (address === '') address = session.message.address;
  } catch (error) {
    console.log(error);
  }
});

bot
  .dialog('start', [
    session => {
      address = session.message.address;
      isCron = true;
      session.send('Alright I will start reminding you!');
    }
  ])
  .triggerAction({
    matches: /^!start/i
  });

bot
  .dialog('stop', [
    session => {
      session.send('I will stop reminding you now :(');
      isCron = false;
    }
  ])
  .triggerAction({
    matches: /^!stop/i
  });

bot
  .dialog('test', [
    session => {
      session.send([
        'I am working properly! Thanks for checking on me <3',
        "Yup i'm going good :)",
        'Your test is a success!'
      ]);
    }
  ])
  .triggerAction({
    matches: /^!test/i
  });

new CronJob(
  '0 21 * * 4',
  function() {
    console.log('Running Cron...');
    if (isCron) {
      if (address !== '') {
        bot.loadSession(address, (err, session) => {
          session.send([
            'You need to take the trash out!',
            'Remember to take the trash out!',
            'Looks like its that time again!',
            'You know what you have to do!'
          ]);
        });
      }
    }
  },
  null,
  true,
  'Pacific/Auckland'
);
