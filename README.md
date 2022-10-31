# Gen TwitterAPIKit Code

Code generator for [TwitterAPIKit](https://github.com/mironal/TwitterAPIKit).

## Usage

### Example 1

```swift
❯ npm run dev -- gen paths./2/dm_conversations.post

> gen_twitter-api-kit_code@1.0.0 dev
> tsx src/index.ts gen paths./2/dm_conversations.post

import Foundation

/// Creates a new DM Conversation.
/// Required OAuth 2.0 scopes: dm.write, tweet.read, users.read
open class PostDmConversationRequestV2: TwitterAPIRequest {

    /// The conversation type that is being created.
    public let conversationType: ConversationType
    /// Participants for the DM Conversation.
    public let participantIDs: [String]
    /// Attachments to a DM Event.
    public let attachments: [String]?
    /// Text of the message.
    public let text: String?

    public var method: HTTPMethod {
        return .post
    }

    public var path: String {
        return "/2/dm_conversations"
    }

    public var bodyContentType: BodyContentType {
      return .json
    }

    open var parameters: [String: Any] {
        var p = [String: Any]()
        #warning("Please write it yourself as it is difficult to generate automatically.")
        return p
    }

    public init(
        conversationType: ConversationType,
        participantIDs: [String],
        attachments: [String]? = .none,
        text: String? = .none
    ) {
        self.conversationType = conversationType
        self.participantIDs = participantIDs
        self.attachments = attachments
        self.text = text
    }

}
```

### Example 2

```swift
❯ npm run dev -- gen paths./2/dm_conversations/{id}/dm_events.get

> gen_twitter-api-kit_code@1.0.0 dev
> tsx src/index.ts gen paths./2/dm_conversations/{id}/dm_events.get

import Foundation

/// Returns DM Events for a DM Conversation
/// Required OAuth 2.0 scopes: dm.read, tweet.read, users.read
open class GetDmConversationsIdDmEventsRequestV2: TwitterAPIRequest {

    /// The DM Conversation ID.
    public let id: String
    /// The maximum number of results.
    public let maxResults: Int?
    /// This parameter is used to get a specified 'page' of results.
    public let paginationToken: String?
    /// The set of event_types to include in the results.
    public let eventTypes: Set<TwitterDirectMessageEventTypeV2>?
    /// A comma separated list of DmEvent fields to display.
    public let dmEventFields: Set<TwitterDmEventFieldsV2>?
    /// A comma separated list of fields to expand.
    public let expansions: Set<TwitterDmEventExpansionsV2>?
    /// A comma separated list of Media fields to display.
    public let mediaFields: Set<TwitterMediaFieldsV2>?
    /// A comma separated list of User fields to display.
    public let userFields: Set<TwitterUserFieldsV2>?
    /// A comma separated list of Tweet fields to display.
    public let tweetFields: Set<TwitterTweetFieldsV2>?

    public var method: HTTPMethod {
        return .get
    }

    public var path: String {
        return "/2/dm_conversations/\(id)/dm_events"
    }

    open var parameters: [String: Any] {
        var p = [String: Any]()
        maxResults.map { p["max_results"] = $0 }
        paginationToken.map { p["pagination_token"] = $0 }
        eventTypes?.bind(param: &p)
        dmEventFields?.bind(param: &p)
        expansions?.bind(param: &p)
        mediaFields?.bind(param: &p)
        userFields?.bind(param: &p)
        tweetFields?.bind(param: &p)
        return p
    }

    public init(
        id: String,
        maxResults: Int? = .none,
        paginationToken: String? = .none,
        eventTypes: Set<TwitterDirectMessageEventTypeV2>? = .none,
        dmEventFields: Set<TwitterDmEventFieldsV2>? = .none,
        expansions: Set<TwitterDmEventExpansionsV2>? = .none,
        mediaFields: Set<TwitterMediaFieldsV2>? = .none,
        userFields: Set<TwitterUserFieldsV2>? = .none,
        tweetFields: Set<TwitterTweetFieldsV2>? = .none
    ) {
        self.id = id
        self.maxResults = maxResults
        self.paginationToken = paginationToken
        self.eventTypes = eventTypes
        self.dmEventFields = dmEventFields
        self.expansions = expansions
        self.mediaFields = mediaFields
        self.userFields = userFields
        self.tweetFields = tweetFields
    }
}
```
