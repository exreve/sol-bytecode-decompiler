//! Writes the generated bench programs (crates, IDLs, expectations) from the templates in `sbpf_bench::gen`.
//! usage: sbpf-bench-gen

fn main() {
    sbpf_bench::gen::run(&sbpf_bench::repo_root().join("bench"));
}
