// Hardcoded settings for the vendor since they are only using one Mural crypto account
//  and only one Colombian fiat bank account
export const vendorSourceAccountId = "bc739946-59af-4d42-83fb-249d5e62adcf";
export const vendorPayoutDetails = {
  "type": "fiat",
  "fiatAndRailDetails": {
    "type": "cop",
    "symbol": "COP",
    "accountType": "CHECKING",
    "bankAccountNumber": "12323423423",
    "phoneNumber": "+4723849993",
    "documentNumber": "23423423423",
    "documentType": "PASSPORT"
  },
  "bankName": "Rappipay",
  "bankAccountOwner": "Jeff Bezos"
};
export const vendorRecipientInfo = {
  "type": "individual",
  "firstName": "Jeff",
  "lastName": "Bezos",
  "email": "jeff@bezos.com",
  "physicalAddress": {
      "country": "CO",
      "subdivision": "ANT",
      "address1": "123 fake street",
      "state": "ANT",
      "city": "Antioquia City",
      "zip": "11101"
  }
};
