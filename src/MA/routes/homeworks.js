var db = require('../db/db');
var router = require('express').Router();
var formidable = require('formidable');

router.get('/', function (req, res) {
  db.getHomeworks().
    then(function (data) {
      res.render('homeworks', data);
    }, function (err) {
      res.render('homeworks');
    });
})
router.get('/detail/:id', function (req, res) {
  db.getHomework(req.params.id).
    then(function (hw) {
      db.getHomeworkDetail(hw.hwid).
        then(function (detail) {
          res.render('homework-detail', detail);
        });
    }, function (err) {
      res.status(500).send(err);
    })
})
router.get('/review/:id', function (req, res) {
  db.getHomework(req.params.id).
    then(function (hw) {
      db.getHomeworkReview(hw.hwid).
        then(function (reviews) {
          res.render('homework-review', reviews);
        });
    }, function (err) {
      res.status(500).send(err);
    })
})
router.get('/download/:id', function (req, res) {
  db.getHomeworkPath(req.params.id).
    then(function (path) {
      res.sendFile(path);
    }, function (err) {
      res.status(500).send(err);
    });
})
router.post('/upload/:id', function (req, res) {
  var id = req.params.id;
  if (!req.cookies || !req.cookies.uid) res.status(500).send(false);
  else db.getUser(req.cookies.uid).
    then(function (user) {
      db.getHomework(id).
        then(function (hw) {
          var filepath = '../files/' + user.uid + '/' + hw.hwid;
          var filename;
          var form = new formidable.IncommingForm();
          setForm(form, filepath);
          form.on('fileBegin', function (name, file) {
            file.path = form.uploadDir + '/' + file.name;
            filename = file.name;
          });
          form.parse(req);
          form.on('end', function () {
            db.saveHomeworkPath(user.uid, hw.hwid, filepath, filename);
            res.send(true);
          });
          form.on('error', function (err) {res.status(500).send(err);});
        }, function (err) {
          res.status(500).send(err);
        });
    }, function (err) {
      res.status(500).send(err);
    });
})

function setForm (form, filepath) {
  form.encoding = 'utf-8';
  form.uploadDir = filepath;
  form.keepExtensions = false;
  form.maxFieldSize = '50 * 1024 * 1024';
  form.hash = false;
}

module.exports = router;