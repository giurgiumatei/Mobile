import dataStore from 'nedb-promise';

export class IndividualStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(individual) {
    return this.store.insert(individual);
  };
  
  async update(props, individual) {
    return this.store.update(props, individual);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new IndividualStore({ filename: './db/individuals.json', autoload: true });