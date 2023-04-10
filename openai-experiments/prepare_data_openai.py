import pandas as pd
import fire
from typing import Any, Callable, NamedTuple, Optional
from openai_validators import (
    apply_necessary_remediation,
    apply_validators,
    get_validators,
    read_any_format,
    write_out_file,
)

if __name__ == "__main__":
    fire.Fire()

def prepare_data(train_fname, val_fname):
    for fname in [train_fname, val_fname]:
        df, remediation = read_any_format(fname)
        apply_necessary_remediation(None, remediation)
        validators = get_validators()
        apply_validators(
            df,
            fname,
            remediation,
            validators,
            auto_accept,
            write_out_file_func=write_out_file,
        )
