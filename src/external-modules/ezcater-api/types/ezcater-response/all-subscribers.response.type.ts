export type AllSubscribersResponse = {
  data: AllSubscribersResponseData;
};

export type AllSubscribersResponseData = {
  subscribers: SubscriberResponse[];
};

export type SubscriberResponse = {
  id: string;
  name: string;
  subscriptions: SubscriptionResponse[];
};

export type SubscriptionResponse = {
  eventEntity: 'Order';
  eventKey: 'accepted' | 'cancelled';
  parentEntity: 'Caterer';
  parentId: string;
  subscriberId: string;
};
