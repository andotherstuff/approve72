import { NRelay1, NSecSigner } from "@nostrify/nostrify";
import { nip19 } from "nostr-tools";

const relayUrl = Deno.env.get("RELAY_URL");
const groupAddr = Deno.env.get("GROUP_ADDR");
const nsec = Deno.env.get("NSEC");

if (!relayUrl) {
  throw new Error(
    "Missing RELAY_URL environment variable. Should be the relay URL to connect to.",
  );
}
if (!groupAddr) {
  throw new Error(
    "Missing GROUP_ADDR environment variable. Should be an a-tag style value for the target group.",
  );
}
if (!nsec) {
  throw new Error(
    "Missing NSEC environment variable. Should be the nsec of the approver bot.",
  );
}

const decoded = nip19.decode(nsec);

if (decoded.type !== "nsec") {
  throw new Error("Invalid nsec");
}

const signer = new NSecSigner(decoded.data);

const relay = new NRelay1(relayUrl);
const pubkey = await signer.getPublicKey();

console.log("Loading existing member list...");

const members = new Set<string>();

const [existing] = await relay.query([{
  kinds: [34551],
  "#d": [groupAddr],
  authors: [pubkey],
}]);

for (const [name, value] of existing?.tags ?? []) {
  if (name === "p") {
    members.add(value);
  }
}

if (existing) {
  console.log(
    `Found ${members.size} existing member${members.size === 1 ? "" : "s"}`,
  );
} else {
  console.log("Existing member list not found. A new one will be created.");
}

console.log(`Listening for events on ${relayUrl}...`);

for await (const msg of relay.req([{ kinds: [4552], "#a": [groupAddr] }])) {
  if (msg[0] === "EVENT") {
    const [_, _subId, event] = msg;
    console.log(`Got join request from ${event.pubkey}`);

    if (members.has(event.pubkey)) {
      console.log(`Skipped existing member: ${event.pubkey}`);
      continue;
    } else {
      members.add(event.pubkey);

      const list = await signer.signEvent({
        ...existing,
        tags: [
          ["d", groupAddr],
          ...([...members].map((m) => ["p", m])),
        ],
      });

      await relay.event(list);
      console.log(`Approved new member: ${event.pubkey}`);
    }
  }
}
