import { NRelay1, NSecSigner } from "@nostrify/nostrify";
import { nip19 } from "nostr-tools";
import { parseArgs } from "@std/cli/parse-args";

const flags = parseArgs(Deno.args, {
  string: ["nsec", "a", "r"],
});

const decoded = nip19.decode(flags.nsec!);

if (decoded.type !== "nsec") {
  throw new Error("Invalid nsec");
}

const nsec = decoded.data;

if (!flags.a) {
  throw new Error("Missing -a tag for the group");
}

if (!flags.r) {
  throw new Error("Missing -r relay URL");
}

const relay = new NRelay1(flags.r);
const signer = new NSecSigner(nsec);
const pubkey = await signer.getPublicKey();

for await (const msg of relay.req([{ kinds: [4552], "#a": [flags.a] }])) {
  if (msg[0] === "EVENT") {
    const [_, _subId, event] = msg;

    let [list] = await relay.query([{
      kinds: [34551],
      "#d": [flags.a],
      authors: [pubkey],
    }]);

    if (list) {
      if (list.tags.some(tag => tag[0] === "p" && tag[1] === event.pubkey)) {
        continue;
      } else {
        list.tags.push(["p", event.pubkey]);
        list = await signer.signEvent(list);
      }
    } else {
      list = await signer.signEvent({
        kind: 34551,
        tags: [["d", flags.a], ["p", event.pubkey]],
        content: "",
        created_at: Math.floor(Date.now() / 1000),
      });
    }

    await relay.event(list);
  }
}
