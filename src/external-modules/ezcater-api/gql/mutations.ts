export const createSubscriber = `mutation createSubscriber($webhookUrl: String) {
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
  `;

export const createSubscription = `mutation createSubscription(
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
  `;
