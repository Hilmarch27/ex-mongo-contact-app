const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/man', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

// // Menambah satu data
// const contact1 = new Contact({
//     nama: "April",
//     nohp: "082dssd242",
//     email: "april@gmail.com"
// })

// // simpan ke collectuin 
// contact1.save().then((contact) => console.log(contact))