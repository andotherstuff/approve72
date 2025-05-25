# NIP-72 Community Join Request Auto-Approver Bot

A Nostr bot that automatically approves join requests for NIP-72 moderated
communities by maintaining a community member list.

## Overview

This bot monitors a specified relay for join request events (kind 4552)
targeting a specific community and automatically adds the requesting users to
the community's member list. It maintains a replaceable event (kind 34551) that
serves as the community's member roster.

## How It Works

1. **Listens for Join Requests**: The bot subscribes to kind 4552 events that
   are tagged with the specified community's `a` tag
2. **Maintains Member List**: For each join request, it updates or creates a
   kind 34551 replaceable event containing the community member list
3. **Auto-Approval**: New members are automatically added to the `p` tags in the
   member list event

## NIP-72 Context

[NIP-72](https://github.com/nostr-protocol/nips/blob/master/72.md) defines
moderated communities where:

- Communities are defined by kind 34550 events
- Community posts are tagged with the community's `a` tag
- Moderators can approve posts using kind 4550 events
- This bot specifically handles membership management through kind 34551 events

## Prerequisites

- [Deno](https://deno.land/) runtime
- A Nostr private key (nsec format)
- Access to a Nostr relay
- A NIP-72 community identifier

## Installation

1. Clone this repository
2. Ensure Deno is installed on your system
3. Copy `.env.example` to `.env` and configure your environment variables

## Configuration

The bot is configured using environment variables. Create a `.env` file in the
project root with the following variables:

```env
RELAY_URL="wss://relay.example.com"
GROUP_ADDR="34550:pubkey:community-identifier"
NSEC="nsec1your-private-key-here"
```

### Environment Variables

- `RELAY_URL`: The relay URL to connect to (required)
- `GROUP_ADDR`: The community's `a` tag identifier in format
  `34550:<pubkey>:<d-identifier>` (required)
- `NSEC`: Your Nostr private key in nsec format (required)

### Example Configuration

```env
RELAY_URL="wss://relay.chorus.community/"
GROUP_ADDR="34550:932614571afcbad4d17a191ee281e39eebbb41b93fac8fd87829622aeb112f4d:oslo-freedom-forum-2025-mb3ch5ft"
NSEC="nsec1abc123def456..."
```

## Usage

### Run the Bot

```bash
deno task start
```

Or run directly:

```bash
deno run -A --env-file main.ts
```

### Development Mode

Run with file watching for automatic restarts during development:

```bash
deno task dev
```

### Dependencies

- `@nostrify/nostrify`: Nostr protocol implementation
- `nostr-tools`: Nostr utilities and key handling

## Security Considerations

- **Private Key Security**: Never commit your `.env` file or nsec to version
  control. The `.env` file is already included in `.gitignore` for safety
- **Environment Variables**: Store sensitive configuration in environment
  variables or use secure key management systems in production
- **Relay Trust**: Only connect to trusted relays
- **Community Management**: Ensure you have proper authorization to manage the
  target community
- **Rate Limiting**: The bot processes requests as they come in; consider
  implementing rate limiting for high-traffic communities

## Event Types

### Input Events (Kind 4552)

The bot listens for join request events with:

- `kind`: 4552 (join request)
- `#a` tag: Matching the specified community identifier

### Output Events (Kind 34551)

The bot creates/updates member list events with:

- `kind`: 34551 (community member list)
- `#d` tag: Community identifier
- `#p` tags: List of member public keys

## Limitations

- Only handles automatic approval (no rejection logic)
- Requires the bot operator to be authorized to manage the community
- No built-in duplicate detection (relies on Nostr's replaceable event
  semantics)
- No member removal functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is in the public domain.

## Related Resources

- [NIP-72: Moderated Communities](https://github.com/nostr-protocol/nips/blob/master/72.md)
- [Nostr Protocol](https://github.com/nostr-protocol/nostr)
- [Nostrify Documentation](https://jsr.io/@nostrify/nostrify)
