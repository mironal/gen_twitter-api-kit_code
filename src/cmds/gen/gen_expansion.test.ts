import { ExpansionParameterGenerator } from "./gen_expansion"
import { objectByPath } from "../../helper"
import { load } from "../../open_api_loader"

test("gen components.parameters.DmEventExpansionsParameter", async () => {
  const twitterAPI = await load()

  const generator = new ExpansionParameterGenerator()
  const path = "components.parameters.DmEventExpansionsParameter"
  const object = objectByPath(twitterAPI, path)
  const expectCode = `/// A comma separated list of fields to expand.
/// expansions
public enum TwitterDmEventExpansionsV2: TwitterExpansionsParameterV2, Hashable {
    case attachmentsMediaKeys
    case participantIDs
    case referencedTweetsID
    case senderID
    case other(String)

    public var stringValue: String {
        switch self {
        case .attachmentsMediaKeys: return "attachments.media_keys"
        case .participantIDs: return "participant_ids"
        case .referencedTweetsID: return "referenced_tweets.id"
        case .senderID: return "sender_id"
        case .other(let string): return string
        }
    }

    public static let all: Set<Self> = [
        .attachmentsMediaKeys,
        .participantIDs,
        .referencedTweetsID,
        .senderID,
    ]
}
`
  expect(generator.canGenerate(object)).toBe(true)
  expect(generator.generate(path, object)).toBe(expectCode)
})
