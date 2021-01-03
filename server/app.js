export default (express, bodyParser, createReadStream, crypto, http, mongoose, User, cors) => {
    const user = "itmo288706";
    const plain = { 'Content-Type': 'text/plain; charset=utf-8' }
    const app = express();
    app
    .use((req, res, next) => res.set(cors) && next())
    .use(bodyParser.urlencoded({ extended: true }))
    .get('/login/', (req, res) => res.send(user))
    .get('/code/', (req, res) => {
        res.set(plain);
        createReadStream(import.meta.url.substring(7)).pipe(res);
    })
    .get('/users/:url', async (req, res) => {
        const URL = req.body.URL;
        try {
            await mongoose.connect(URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        } catch (error) {
            console.log('error mongo', error);
        }
        const users = await User.find();
        res.locals.usersTitle = 'Users title';
        res.format({
            'aplication/json': () => res.json(users),
            'text/html': () => res.render('users', { users }),
        });
    })
    .get('/sha1/:input', (req, res) => {
        const { input } = req.params;
        const shasum = crypto.createHash('sha1');
        shasum.update(input);
        res.send(shasum.digest('hex'));
    })
    .get('/fetch/', (req, res) => {
        res.render('fetch')
    })
    .get('/promise/', (req, res) => {
        res.set(plain);
        res.end("function task(x) {return new Promise((resolve, reject) => x < 18 ? resolve('yes') : reject('no') ); }")
    })
    .post('/render/', (req, res) => {
        const data = req.body;
        const url = req.params.addr;
        console.log('data', data);
        res.render('index', { data });
    })
    .post('/insert/', async (req, res) => {
        try {
            const { URL, login, password } = req.body;
            await mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true});

            const newUser = new User({ login, password });
            await newUser.save();
            res.status(201).send(`User was saved with login ${login}`);
        } catch (e) {
            res.send(e.codeName);
        }   
    })
    .all('/req/', (req, res) => {
        try {
            let url = req.method === 'POST' ? req.body.addr : req.query.addr;
            http.get(url, (response) => {
                let data = '';
                response.on('data', chunk => (data += chunk));
                response.on('end', () => res.set(plain).end(data));
            });
        } catch (error) {
            res.send("error, can`t be fetched")
        }
    })
    .all('*', (req, res) => res.send(user))
    .use((error, req, res, next) => console.log(error) && res.status(500).set(cors).send('Error'))
    .set('view engine', 'pug');
    return app;
}