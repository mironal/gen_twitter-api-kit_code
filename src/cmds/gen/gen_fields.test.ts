import { FieldGenerator } from "./gen_fields"
import { objectByPath } from "../../helper"
import { load } from "../../open_api_loader"

test("gen components.parameters.DmEventFieldsParameter", async () => {
  const twitterAPI = await load()

  const generator = new FieldGenerator()
  const path = "components.parameters.DmEventFieldsParameter"
  const object = objectByPath(twitterAPI, path)
  const expectCode = `/// A comma separated list of DmEvent fields to display.
/// dm_event.fields
public enum TwitterDmEventFieldsV2: TwitterAPIv2RequestParameter, Hashable {
    case attachments
    case createdAt
    case dmConversationID
    case eventType
    case id
    case participantIDs
    case referencedTweets
    case senderID
    case text
    case other(String)

    public var stringValue: String {
        switch self {
        case .attachments: return "attachments"
        case .createdAt: return "created_at"
        case .dmConversationID: return "dm_conversation_id"
        case .eventType: return "event_type"
        case .id: return "id"
        case .participantIDs: return "participant_ids"
        case .referencedTweets: return "referenced_tweets"
        case .senderID: return "sender_id"
        case .text: return "text"
        case .other(let string): return string
        }
    }

    public static let all: Set<Self> = [
        .attachments,
        .createdAt,
        .dmConversationID,
        .eventType,
        .id,
        .participantIDs,
        .referencedTweets,
        .senderID,
        .text,
    ]
}

extension Set where Element == TwitterDmEventFieldsV2 {
    func bind(param: inout [String: Any]) {
        param["dm_event.fields"] = commaSeparatedString
    }
}
`

  expect(generator.canGenerate(object)).toBe(true)
  expect(generator.generate(path, object)).toBe(expectCode)
})
