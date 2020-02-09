use web_view::*;

fn main() {
    web_view::builder()
        .title("EPub Poc")
        .content(Content::Html(include_str!("../dist/release.html")))
        .size(1200, 720)
        .resizable(true)
        .debug(true)
        .user_data(())
        .invoke_handler(|_webview, _arg| Ok(()))
        .run()
        .unwrap();
}
