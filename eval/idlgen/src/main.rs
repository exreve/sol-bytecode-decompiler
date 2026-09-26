// usage: idlgen <program/src/lib.rs> > idl.json
fn main() {
	let path = std::env::args().nth(1).expect("usage: idlgen <lib.rs>");
	let idl = anchor_syn::idl::parse::file::parse(path, "0.1.0".into(), false, true, false).expect("idl parse");
	println!("{}", serde_json::to_string_pretty(&idl).unwrap());
}
