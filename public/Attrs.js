
var func = new Function("prevCompany, Event", "return prevCompany['company/shareholders'];" )
var func2 = new Function("prevCompany, Event", "console.log(prevCompany['company/shareholders']) ;" )

let eventTypes = {
    "incorporation": {
      label: "Stiftelse",
      inputAttributes: ["transaction/records", "company/AoA/nominalSharePrice"],
      eventInputCriteria: [ //Is the combination of inputs valid? Not taking into account anything but the provided event input.
        (Event) => Event["type"] === "process",
        (Event) => Event["process/identifier"] === "incorporation",
      ],
      applicabilityCriteria: [ //Is the eventType applicable to the current state of the company?
        (Company) => Company["company/appliedEventsCount"] === 0,
      ],
      calculatedOutputs: ["event/isIncorporated", "event/shareCountIncrease", "event/shareCapitalIncrease", "event/accountBalance"],
      dependencies: ["company/isIncorporated", "company/orgnumber", "company/AoA/nominalSharePrice", "company/shareCount", "company/shareholders", "company/shareCapital", "company/accountBalance"] //Which calculatedAttributes need to be recalculated as a consequence of applying the event?
    },
    "operatingCost": {
      label: "Driftskostnader",
      inputAttributes: ["transaction/generic/account", "transaction/amount"],
      eventInputCriteria: [
        (Event) => Event["type"] === "process",
        (Event) => Event["process/identifier"] === "operatingCost",
        (Event) => Number(Event["transaction/generic/account"]) >= 3000 && Number(Event["transaction/generic/account"]) < 8000,
      ],
      applicabilityCriteria: [
        (Company) => Company["company/isIncorporated"] === true,
      ],
      calculatedOutputs: ["event/accountBalance"],
      dependencies: ["company/accountBalance"]
    }
  }


let inputAttributes = {
  "entity/type": {
    "attr/name": "entity/type",
    "attr/valueType": "string",
    "attr/doc": "String name used to distinguish between a set of defined object types, eg. 'User' or 'Event'.",
    "attr/validatorFunction": (value) => [
        value => ["event"].includes(value)
    ].every( validator => validator(value) ),
  },
  "event/eventType": {
    "attr/name": "event/eventType",
    "attr/valueType": "string",
    "attr/doc": "String name used to distinguish between a set of defined event types, eg. 'incorporation' or 'operatingCost'.",
    "attr/validatorFunction": (value) => [
        value => Object.keys(eventTypes).includes(value)
    ].every( validator => validator(value) ),
  },
  "event/index": {
    "attr/name": "event/index",
    "attr/valueType": "number",
    "attr/doc": "The index of a given event in the timeline of a given company.",
    "attr/validatorFunction": (value) => [
        value => typeof value === "number",
        value => value >= 1
    ].every( validator => validator(value) ),
  },
  "event/date": {
    "attr/name": "event/date",
    "attr/valueType": "string",
    "attr/doc": "YYYY-MM-DD date to show on the company's timeline.",
    "attr/validatorFunction": (value) => [
        value => typeof value === "string",
    ].every( validator => validator(value) ),
    "attr/viewFunction": (Event, A) => d( JSON.stringify(Event) )
  },
  "event/incorporation/nominalSharePrice": {
    "attr/name": "event/incorporation/nominalSharePrice",
    "attr/valueType": "number",
    "attr/doc": "Nominal price per share as according to the company's articles of assembly.",
    "attr/validatorFunction": (value) => typeof value === "number",
    "attr/viewFunction": (Event, A) => d( JSON.stringify(Event) )
  }, 
  "event/incorporation/founder": {
    "attr/name": "event/incorporation/founder",
    "attr/valueType": "object",
    "attr/doc": "Array of objects containng shareholderID, shareCount and sharePremium for each founder of the company.",
    "attr/validatorFunction": (value) => Array.isArray(value) 
    ? value.map( founder => (
        typeof founder["shareholderID"] === "string" && 
        typeof founder["shareCount"] === "number" && 
        typeof founder["sharePremium"] === "number"  
       ) ).every( founderValidation => founderValidation === true )
    : false,
    "attr/viewFunction": (Event, A) => d( JSON.stringify(Event) )
  },
  // event/error, from companyConstructor
  "event/incorporation/orgnumber": {
    "attr/name": "event/incorporation/orgnumber",
    "attr/valueType": "string",
    "attr/doc": "Norwegian organizational number as according to the company's articles of assembly.",
    "attr/validatorFunction": (value) => (typeof value === "string" && value.length === 9 && Number(value) >= 800000000 ),
    "attr/viewFunction": (Event, A) => d( JSON.stringify(Event) )
  }
}

let outputFunctions = {
  "event/accountBalance": (prevCompany, Event) => mergerino( {}, Event["recordObjects"].map( record => record.account ).filter( filterUniqueValues ).map( account => createObject(account, Event["recordObjects"].filter( record => record.account === account ).reduce( (sum, record) => sum + record.amount, 0) )) ),
  "event/incorporation/shareCount": (prevCompany, Event) => Event["event/incorporation/founders"].reduce( (sum, founderObject) => sum + founderObject.shareCount, 0),
  "event/incorporation/shareCapital": (prevCompany, Event) => Event["event/incorporation/founders"].reduce( (sum, founderObject) => sum + (nominalSharePrice + founderObject.sharePremium) *  founderObject.shareCount, 0),
  "event/incorporation/shareholders": (prevCompany, Event) => Event["event/incorporation/founders"].map( shareholder => shareholder["id"] ).filter( filterUniqueValues ),
  "company/orgnumber": (prevCompany, Event) => Event["event/incorporation/orgnumber"] ? Event["event/incorporation/orgnumber"] : prevCompany["company/orgnumber"],
  "company/Events": (prevCompany, Event) => prevCompany["company/Events"] ? prevCompany["company/Events"].concat(Event) : [Event],
  "company/nominalSharePrice": (prevCompany, Event) => ifNot(Event["event/incorporation/nominalSharePrice"], prevCompany["company/nominalSharePrice"]),
  "company/shareCount": (prevCompany, Event) => Event["event/incorporation/shareCount"] ? prevCompany["company/shareCount"] + Event["event/incorporation/shareCount"] : Event["company/shareCount"],
  "company/shareholders": (prevCompany, Event) => ifNot( Event["event/incorporation/shareholders"], prevCompany["company/shareholders"] ),
  "company/shareCapital": (prevCompany, Event) => Event["event/eventType"] === "incorporation" ? Event["event/incorporation/shareCapital"] : prevCompany["company/shareCapital"],
  "company/accountBalance": (prevCompany, Event) => Event["event/eventType"] === "incorporation" ? Event["event/accountBalance"] : addAccountBalances(prevCompany["company/accountBalance"], Event["event/accountBalance"]),
  "company/validEventTypes": (prevCompany, Event) => ["incorporation", "incorporationCost", "operatingCost", "shareholderLoan_increase", "investment_new"],
}