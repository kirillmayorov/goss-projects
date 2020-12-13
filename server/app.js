export default (express, bodyParser, createReadStream, crypto, http, mongoose, User, cors) => {
    const user  = "itmo287667";
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
    .get('/sha1/:input', (req, res) => {
        const { input } = req.params;
        const shasum = crypto.createHash('sha1');
        shasum.update(input);
        res.send(shasum.digest('hex'));
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
    .use((error, req, res, next) => res.status(500).set(cors).send('Error'));
    return app;
}