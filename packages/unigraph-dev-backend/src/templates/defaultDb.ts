/**
 * This file defines all default information needed to set up Unigraph on Dgraph.
 * 
 * Default database entries includes default userland schemas (primitive, composers) and default dgraph schemas (and types).
 */

export const defaultTypes = `<_value>: uid .
<_value.#i>: int .
<_value.#>: float .
<_value.?>: bool .
<_value.%>: string .
<_value.>: default .
<_value[>: [uid] .
<definition>: uid .
<type>: uid .
<unigraph.id>: string @index(exact) .
type <Entity> {
	type
}
type <Type> {
	definition
}
`

export const defaultUserlandSchemas = [
    {
        "unigraph.id": "$/primitive/number"
    },
    {
        "unigraph.id": "$/primitive/boolean"
    },
    {
        "unigraph.id": "$/primitive/string"
    },
    {
        "unigraph.id": "$/primitive/null"
    },
    {
        "unigraph.id": "$/primitive/undefined"
    },
    {
        "unigraph.id": "$/composer/Array"
    },
    {
        "unigraph.id": "$/composer/Object"
    },
    {
        "unigraph.id": "$/unigraph",
        "version": "schema-v0.0.1dev"
    }
]