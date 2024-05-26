/**
 * To change a query, change the corresponding .gql file and paste it in here.
 */
export const queries = {
  allCaterers: `query allCaterers {
    caterers {
      live
      name
      storeNumber
      uuid
      address {
        city
        deliveryInstructions
        name
        state
        stateName
        street
        street2
        street3
        zip
      }
    }
  }`,
  allSubscribers: `query allSubscribers {
    subscribers {
      id
      name
      subscriptions {
        eventEntity
        eventKey
        parentEntity
        parentId
        subscriberId
      }
    }
  }
  `,
  getOrderById: `query getOrderById($orderId: String!) {
    order(id: $orderId) {
      deliveryId
      uuid
      caterer {
        address {
          city
          deliveryInstructions
          name
          state
          stateName
          street
          street2
          street3
          zip
        }
        live
        name
        storeNumber
        uuid
      }
      catererCart {
        feesAndDiscounts {
          __typename
        }
        orderItems {
          quantity
          name
          totalInSubunits {
            subunits
          }
          customizations {
            customizationTypeName
            name
            quantity
          }
        }
        tableware {
          specialInstructions
          tablewareChoices {
            choiceUuid
            isIncluded
            itemCount
            name
          }
        }
        totals {
          catererTotalDue
        }
      }
      event {
        address {
          city
          deliveryInstructions
          name
          state
          stateName
          street
          street2
          street3
          zip
        }
        catererHandoffFoodTime
        contact {
          name
          phone
        }
        customerProvidedName
        headcount
        orderType
        thirdPartyDeliveryPartner
        timeZoneIdentifier
        timeZoneOffset
        timestamp
      }
      isTaxExempt
      lifecycle {
        orderIsCurrently
      }
      orderCustomer {
        firstName
        fullName
        lastName
      }
      orderNumber
      orderSourceType
      taxableAddress {
        city
        deliveryInstructions
        name
        state
        stateName
        street
        street2
        street3
        zip
      }
      totals {
        customerTotalDue {
          currency
          subunits
          subunitsV2
        }
        pointOfSaleIntegrationFee {
          currency
          subunits
          subunitsV2
        }
        salesTax {
          currency
          subunits
          subunitsV2
        }
        salesTaxRemittance {
          currency
          subunits
          subunitsV2
        }
        subTotal {
          currency
          subunits
          subunitsV2
        }
        tip {
          currency
          subunits
          subunitsV2
        }
      }
    }
  }`,
  menusByCaterer: `query menusbyCaterer($catererId: String!) {
    menu(catererId: $catererId) {
      endDate
      id
      name
      startDate
    }
  }
  `,
};
