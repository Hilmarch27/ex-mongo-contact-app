const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const {body, validationResult, check } = require('express-validator')
const methodOverride = require('method-override')

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// koneksi
require('./utils/db')
const Contact = require('./model/contact');
const res = require('express/lib/response');

const app = express();
const port = 3000;

// Setup Method Override
app.use(methodOverride('_method'))

//Setup ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
//built-in middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);
app.use(flash());


// Halaman Home
app.get('/', (req, res) => {
    res.render('index', {
      layout: 'layouts/main-layout',
      title: 'Halaman Home'});
  });

// Halaman About
app.get('/about', (req, res) => {
    res.render('about', {
        layout: 'layouts/main-layout',
        title: 'Halaman About'});
});

// Halaman Contact
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();

    res.render('contact',  {
        layout: 'layouts/main-layout',
        title: 'Halaman Contact',
        contacts,
        msg: req.flash('msg')
    });
});

// halaman form tambah data contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact',  {
        layout: 'layouts/main-layout',
        title: 'Form Tambah Data Contact'
    });
});

// proses tambah data contact
app.post('/contact', [
    body('nama').custom(async(value) => {
        const duplikat = await Contact.findOne({ nama: value});
            if (duplikat) {
                throw new Error('Nama contact sudah digunakan!');
            }
            return true;
        }),
    check('email', 'Email Tidak Valid').isEmail(),
    check('nohp', 'NO HP Tidak Valid').isMobilePhone('id-ID')
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('add-contact', {
                layout: 'layouts/main-layout',
                title: 'Form Tambah Data Contact',
                errors: errors.array()
            });
        } else {
            Contact.insertMany(req.body, (error, result) => {
            // kirimkan flash message
            req.flash('msg', 'Data contact berhasil ditambahkan!');
            res.redirect('/contact');
        })
    }
    });

// proses delete contact
app.delete('/contact', (req, res) => {
    Contact.deleteOne({nama: req.body.nama}).then((result) => {
    // kirimkan flash message
    req.flash('msg', 'Data contact berhasil dihapus!');
    res.redirect('/contact');
    })
})

// halaman form ubah data contact
app.get('/contact/edit/:nama',async (req, res) => {
    const contact = await Contact.findOne({nama :  req.params.nama});

    res.render('edit-contact',  {
        layout: 'layouts/main-layout',
        title: 'Form Ubah Data Contact',
        contact,
    });
});

// proses ubah data contact
app.put('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({nama: value});
            if (value !== req.body.oldNama && duplikat) {
                throw new Error('Nama contact sudah digunakan!');
            }
            return true;
    }),
    check('email', 'Email Tidak Valid').isEmail(),
    check('nohp', 'NO HP Tidak Valid').isMobilePhone('id-ID')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('edit-contact', {
                layout: 'layouts/main-layout',
                title: 'Form Ubah Data Contact',
                errors: errors.array(),
                contact: req.body
            });
        } else {
            Contact.updateOne(
                { _id: req.body._id},
                {
                    $set: {
                        nama: req.body.nama,
                        email: req.body.email,
                        nohp: req.body.nohp,
                    },
                }
                ).then((result) => {
            // kirimkan flash message
            req.flash('msg', 'Data contact berhasil diubah!');
            res.redirect('/contact');
        })
    }
    });

//halaman detail contact
app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama});

    res.render('detail',  {
        layout: 'layouts/main-layout',
        title: 'Halaman Detail Contact',
        contact
    });
});


app.listen(port, () => {
    console.log(`Mongo Contact App | at http://localhost:${port}`);
    }
);


