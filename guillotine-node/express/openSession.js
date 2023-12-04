const newSession = input=> 
  [ {dataType : 'result', params: input} ];

const openSession = {
  get : (req, res) => {
    const { params } = req.params;
    console.log(params, 'params');
    newSession (params)
      .then (results=>{
        res.type('application/json');
        res.status(200);
        res.send(results);
        // res.render(results);
      })
      .catch (e=> {
        console.log('ERROR: ', err)
      }) ;
  }
}

module.exports = getResults;
