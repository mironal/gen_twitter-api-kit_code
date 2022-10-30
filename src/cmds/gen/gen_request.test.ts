import { RequestGenerator } from "./gen_request"
import { objectByPath } from "../../helper"
import { load } from "../../open_api_loader"

test("gen paths./2/dm_events.get", async () => {
  const twitterAPI = await load()

  const generator = new RequestGenerator()
  const path = "paths./2/dm_events.get"
  const object = objectByPath(twitterAPI, path)
  const expectCode = `import Foundation

/// Returns recent DM Events across DM conversations
/// Required OAuth 2.0 scopes: dm.read, tweet.read, users.read
open class GetDmEventsRequestV2: TwitterAPIRequest {

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
        return "/2/dm_events"
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
        maxResults: Int? = .none,
        paginationToken: String? = .none,
        eventTypes: Set<TwitterDirectMessageEventTypeV2>? = .none,
        dmEventFields: Set<TwitterDmEventFieldsV2>? = .none,
        expansions: Set<TwitterDmEventExpansionsV2>? = .none,
        mediaFields: Set<TwitterMediaFieldsV2>? = .none,
        userFields: Set<TwitterUserFieldsV2>? = .none,
        tweetFields: Set<TwitterTweetFieldsV2>? = .none
    ) {
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
`
  expect(generator.canGenerate(object)).toBe(true)
  expect(generator.generate(path, object)).toBe(expectCode)
})

it("gen paths./2/dm_conversations/with/{participant_id}/dm_events.get", async () => {
  const twitterAPI = await load()

  const generator = new RequestGenerator()
  const path = "paths./2/dm_conversations/with/{participant_id}/dm_events.get"
  const object = objectByPath(twitterAPI, path)
  const expectCode = `import Foundation

/// Returns DM Events for a DM Conversation
/// Required OAuth 2.0 scopes: dm.read, tweet.read, users.read
open class GetDmConversationsWithParticipantIdDmEventsRequestV2: TwitterAPIRequest {

    /// The ID of the participant user for the One to One DM conversation.
    public let participantID: String
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
        return "/2/dm_conversations/with/\\(participantID)/dm_events"
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
        participantID: String,
        maxResults: Int? = .none,
        paginationToken: String? = .none,
        eventTypes: Set<TwitterDirectMessageEventTypeV2>? = .none,
        dmEventFields: Set<TwitterDmEventFieldsV2>? = .none,
        expansions: Set<TwitterDmEventExpansionsV2>? = .none,
        mediaFields: Set<TwitterMediaFieldsV2>? = .none,
        userFields: Set<TwitterUserFieldsV2>? = .none,
        tweetFields: Set<TwitterTweetFieldsV2>? = .none
    ) {
        self.participantID = participantID
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
`
  expect(generator.canGenerate(object)).toBe(true)
  expect(generator.generate(path, object)).toBe(expectCode)
})
