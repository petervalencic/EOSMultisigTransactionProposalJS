const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig");
const fetch = require("node-fetch");
const { TextDecoder, TextEncoder } = require("util");
const account1 = "*********";
const account2 = "************";
const privateKeys = ["***********************************"];

const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc("http://eos.greymass.com", { fetch });
const api = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder(),
});

const expirationDate = () => {
  let date = new Date();
  date.setDate(date.getDate() + 1);
  console.log(date.toISOString().slice(0, 19));
  return date.toISOString().slice(0, 19);
};

const randomProposalName = () => {
  let result = "";
  let characters = "abcdefghij12345";
  let charactersLength = characters.length;
  for (var i = 0; i < 13; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//main
(async () => {
  
  const actions = [
    {
      account: "eosio.token",
      name: "transfer",
      authorization: [
        {
          actor: account1,
          permission: "active",
        },
      ],
      data: {
        from: account1,
        to: account2,
        quantity: "2.0000 EOS",
        memo: "msig transaction test",
      },
    },
  ];

  const serialized_actions = await api.serializeActions(actions);
  console.log(JSON.stringify(serialized_actions));

  const proposeInput = {
    proposer: account1,
    proposal_name: randomProposalName(),
    requested: [
      {
        actor: account1,
        permission: "active",
      },
      {
        actor: account2,
        permission: "active",
      },
    ],
    trx: {
      expiration: expirationDate(),
      ref_block_num: 0,
      ref_block_prefix: 0,
      max_net_usage_words: 0,
      max_cpu_usage_ms: 0,
      delay_sec: 0,
      context_free_actions: [],
      actions: serialized_actions,
      transaction_extensions: [],
    },
  };

  console.log(JSON.stringify(proposeInput));

  let data = await api.transact(
    {
      actions: [
        {
          account: "eosio.msig",
          name: "propose",
          authorization: [
            {
              actor: account1,
              permission: "active",
            },
          ],
          data: proposeInput,
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
      broadcast: true,
      sign: true,
    }
  );

  console.log(JSON.stringify(data));

  console.log("end");
})();
