'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv');


const server = express();
server.use(cors());

const PORT = process.env.PORT || 5000;








server.listen(PORT,()=>{
  console.log(`listening to PORT ${PORT}`);
});
