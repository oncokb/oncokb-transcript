# Info

The models under this folder come from https://github.com/bhsingh/utility

We modified the property `value` in AbstractText and Abstract because the value also includes HTML Tags. We have to trim the tag but keep the text.

#### New

```new
    @XmlMixed
    @XmlAnyElement
    protected List<java.lang.Object> value;
```

#### Old

```old
    @XmlValue
    protected String value;
```
