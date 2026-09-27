//! `sbpf-decompile`: the decompiler's command line (see `sbpf_cli::USAGE`).

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let threads = std::thread::available_parallelism().map_or(1, |n| n.get());
    // deeply nested programs are walked recursively: run on a thread with a large stack
    let t = std::thread::Builder::new()
        .stack_size(1 << 30)
        .spawn(move || sbpf_cli::run(&args, threads))
        .expect("spawn");
    let code = t.join().unwrap_or(1);
    std::process::exit(code);
}
