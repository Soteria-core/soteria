import Vue from 'vue'

const Bus = new Vue();

Bus.$EventNames = {
  initMember: "Global:initMember",
  resetAllowance: "Allowance:reset",
  refreshAllowance: "Allowance:refresh",
  allowance: "Allowance:get",
  setNeedAllowance: "Allowance:need",
  refreshBalance: "Global:refreshBalance",
  switchAccount: "Global:switchAccount",
}

Bus.events = {
};

Object.values(Bus.$EventNames).forEach((event)=>{
  Bus.events[event] = {};
});
Bus.$emitGroup = function(eventName, ...params){
  const events = Object.values(Bus.events[eventName]);
  events.forEach((event)=>{
    Bus.$emit(event, params);
  });
}
Bus.bindEvent = function(eventName, key, callback){
  const eventKey = `${eventName}:${key}`;
  this.events[eventName][key] = eventKey;
  this.$on(eventKey, callback);
}
Bus.unbindEvent = function(eventName, key){
  delete this.events[eventName][key];
  this.$off(this.events[eventName][key]);
}
Bus.unbindGroup = function(eventName){
  let event = this.events[eventName];
  for(let key in event){
      this.$off(event[key]);
      delete event[key];
  }
}

export default Bus;
