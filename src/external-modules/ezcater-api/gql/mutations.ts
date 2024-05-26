/**
 * To change a mutation, change the corresponding .gql file and paste it in here.
 */
export const mutations = {
  createSubscriber: `mutation createSubscriber($webhookUrl: String) {
    createSubscriber(
      subscriberParams: { name: "Caterflow Integration", webhookUrl: $webhookUrl }
    ) {
      subscriber {
        id
        name
        webhookUrl
        webhookSecret
      }
    }
  }
  `,
  createSubscription: `mutation createSubscription(
    $subscriberId: String!
    $eventKey: String!
    $catererId: String!
  ) {
    createSubscription(
      subscriptionParams: {
        subscriberId: $subscriberId
        eventKey: $eventKey
        eventEntity: Order
        parentEntity: Caterer
        parentId: $catererId
      }
    ) {
      subscription {
        parentEntity
        parentId
        eventKey
        eventEntity
      }
    }
  }
  `,
};
